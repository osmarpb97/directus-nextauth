import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import jwt_decode from "jwt-decode";
import axios from "axios";
import { redlock, redis } from "lib/redis";

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credential Directus API",
            credentials: {
                username: { label: "Email", type: "email", placeholder: "jsmith" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const credential = {
                    email: credentials.username,
                    password: credentials.password,
                };

                try {
                    const auth = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
                        credential
                    );

                    const profile = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                        headers: {
                            Authorization: `Bearer ${auth.data.data.access_token}`
                        }
                    }
                    );

                    var user = {
                        ...auth.data.data,
                        profile: { ...profile.data.data },
                    }

                    if (user) {
                        return user;
                    }

                    return null;
                } catch (error) {
                    console.log(error);
                    const errorMessage = error.response.errors.message;
                    throw new Error(errorMessage);
                }
            },
        }),
    ],
    secret: process.env.JWT_SECRET,
    session: {
        strategy: 'jwt'
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },

    callbacks: {
        jwt: async ({token, user, account}) => {
            // First time token is created
            if (account && user) {
                token.access_token = user.access_token;
                token.refresh_token = user.refresh_token;
                token.expires_in = jwt_decode(user.access_token)[`exp`]; 
                token.user = user.profile;

                // Save the token
                await redis.set(`token:${token.user.id}`, JSON.stringify(token));

                return token;
            }

            return await redlock.using([token.user.id, "jwt-refresh"], 5000, async () => {
                const redisToken = await redis.get(`token:${token.user.id}`);
                const currentToken = JSON.parse(redisToken);

                if (Date.now() < (currentToken.expires_in - 300) * 1000) {
                    return currentToken;
                }

                // console.log('Refreshing token');

                // Otherwise, refresh the token
                return refreshAccessToken(token);
            });




        },

        session: async ({session, token}) => {
            if (token) {
                session.user = token.user;
                session.access_token = token.access_token;
                session.refresh_token = token.refresh_token;
                session.expires_in = token.expires_in;
            }
            return session;
        },

    },

});

async function refreshAccessToken(token) {
    try {
        const response = await axios.post(
            `${ process.env.NEXT_PUBLIC_API_URL }/auth/refresh`,
            {
                refresh_token: token.refresh_token,
            }
        );

        const profile = await axios.get(`${ process.env.NEXT_PUBLIC_API_URL }/users/me`, {
            headers: {
                Authorization: `Bearer ${response.data.data.access_token}`
            }
        });

        const exp = jwt_decode(response.data.data.access_token)[`exp`];

        var newToken = {
            ...response.data.data,
            expires_in: exp,
            user: { ...profile.data.data }
        }

        await redis.set(`token:${newToken.user.id}`, JSON.stringify(newToken));

        return newToken

        
    } catch (error) {
        console.log(error);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}



