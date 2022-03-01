# Next.js TailwindCSS Typescript next-auth and directus as API
This is a [Next.js](https://nextjs.org/) 12.x, [TailwindCSS](https://tailwindcss.com/) 2.x, and [TypeScript](https://www.typescriptlang.org/docs/home.html) 4.x and Directus CMS starter template 

## Getting Started
Go to the api dir and change the name of the .env-sample file to .env then go to the app dir and do the same to the .env-sample file 




Install dependencies:
```bash
docker-compose up
```

The admin credentials of Directus should apear on the console

And you can LogIn  on http://localhost:3000/api/auth/signin

Open for frontend [http://localhost:3000](http://localhost:3000) and [http://localhost:5432](http://localhost:5432) for directus API with your browser to see the result.



You can start editing the page by modifying `src/pages/index.js`. The page auto-updates as you edit the file.


## Security notes
I provide a ready to go config but if you want to deploy your app please change the following env vars

On the api .env file:
```
KEY=
SECRET=
```

On the app .env file:
```
JWT_SECRET=
```
