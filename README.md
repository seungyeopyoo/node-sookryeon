### Express.js, MySQL을 활용해 나만의 채용 서비스 백엔드 서버 만들기

1. **API 명세서를 작성**하여 프론트엔드 개발자와 원활히 협업 할 수 있어요.
2. **ERD를 작성**하여 RDB(MySQL)를 이용한 데이터 모델링을 할 수 있어요.
3. **MySQL, Prisma**를 이용해 데이터베이스를 설계하고 활용 할 수 있어요.
4. **JWT, Middleware**를 활용해 인증과 인가 기능을 구현할 수 있어요.
5. **Transaction**의 동작 방식과 활용처를 알고 직접 구현할 수 있어요.
6. **AWS EC2**에 Express.js를 이용한 웹 서비스를 배포할 수 있습니다.





***




	


 **기술 스택**
 **웹 프레임워크**: Node.js에서 가장 대표적인 웹 프레임워크인 **Express.js**를 사용합니다.

 
 **패키지 매니저**: 대형 코드의 일관성, 보안, 성능 문제 해결에 적합한 **yarn** 패키지 매니저를 사용합니다.

 
 **모듈 시스템**: 최신 JS 문법을 지원하는 ESM(ES6 모듈 시스템)을 사용합니다.

 
 **데이터베이스**: 대표적인 **RDBMS**인 **MySQL**을 직접 설치하지 않고, Cloud 서비스 **AWS RDS**에서 대여해 사용합니다.

 
 **ORM**: **MySQL**의 데이터를 쉽게 읽고 쓰게 해주는 [Prisma](https://www.prisma.io/)를 사용합니다.

 
 **인증**: 확장성이 뛰어나며 다양한 플랫폼에서 이용 가능한 [**JWT(JSON Web Token)**](https://jwt.io/)를 이용합니다.

 ***
 **API 명세서** [링크](https://www.notion.so/714fa4f9daca48d2af7ab526bffae5cc?v=5cacc2ab4380414aba6a8e926acf06d8)
***
 **ERD** [링크](https://drawsql.app/teams/ysy-1/diagrams/node-sookryeon)
 ***
```
├── node_modules // Git에는 올라가지 않습니다.
├── prisma
│   └── schema.prisma
├── src
│   ├── constants
│   │   ├── auth.constant.js
│   │   ├── env.constant.js
│   │   ├── resume.constant.js
│   │   └── user.constant.js
│   ├── middlewares
│   │   ├── error-handler.middleware.js
│   │   ├── require-access-token.middleware.js
│   │   ├── require-refresh-token.middleware.js
│   │   └── require-roles.middleware.js
│   ├── routers
│   │   ├── auth.router.js
│   │   ├── index.js
│   │   ├── resumes.router.js
│   │   └── users.router.js
│   ├── utils
│   │   └── prisma.util.js
│   └── app.js
├── .env // Git에는 올라가지 않습니다.
├── .env.example // Git에 올라갑니다. .env의 복사본으로 Key만 있고 Value는 삭제합니다.
├── .gitignore
├── .prettierrc
├── package.json
├── README.md
└── yarn.lock // npm을 사용하면 package-lock.json
```
 

 
