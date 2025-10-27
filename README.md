
```
Cravins
├─ client
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ public
│  │  ├─ coin.png
│  │  ├─ cravins.png
│  │  ├─ favicon.ico
│  │  └─ images
│  │     ├─ 1.jpg
│  │     ├─ 2.jpg
│  │     ├─ 3.jpg
│  │     ├─ 4.jpg
│  │     ├─ 5.jpg
│  │     ├─ 6.jpg
│  │     ├─ jamb.png
│  │     ├─ neco.png
│  │     └─ waec.png
│  ├─ src
│  │  ├─ App.jsx
│  │  ├─ components
│  │  │  ├─ chatbot
│  │  │  │  ├─ ChatInput.jsx
│  │  │  │  ├─ ChatInterface.jsx
│  │  │  │  └─ MessageBubble.jsx
│  │  │  ├─ common
│  │  │  │  ├─ Footer.jsx
│  │  │  │  ├─ Header.jsx
│  │  │  │  ├─ LoadingSpinner.jsx
│  │  │  │  ├─ Modal.jsx
│  │  │  │  └─ ProtectedRoute.jsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ AdminDashboard.jsx
│  │  │  │  ├─ RecentActivity.jsx
│  │  │  │  ├─ StatsCard.jsx
│  │  │  │  └─ UserDashboard.jsx
│  │  │  ├─ materials
│  │  │  │  ├─ MaterialCard.jsx
│  │  │  │  ├─ MaterialsList.jsx
│  │  │  │  └─ MaterialUpload.jsx
│  │  │  ├─ news
│  │  │  │  ├─ NewsCard.jsx
│  │  │  │  ├─ NewsDetail.jsx
│  │  │  │  ├─ NewsEditor.jsx
│  │  │  │  └─ NewsList.jsx
│  │  │  ├─ payment
│  │  │  │  ├─ PaymentModal.jsx
│  │  │  │  ├─ PaymentSuccess.jsx
│  │  │  │  └─ PricingCard.jsx
│  │  │  ├─ practice
│  │  │  │  ├─ QuestionContainer.jsx
│  │  │  │  ├─ SubjectSelector.jsx
│  │  │  │  ├─ TestHistory.jsx
│  │  │  │  ├─ TestResults.jsx
│  │  │  │  ├─ Timer.jsx
│  │  │  │  └─ TopicSelector.jsx
│  │  │  └─ videos
│  │  │     ├─ VideoList.jsx
│  │  │     ├─ VideoPlayer.jsx
│  │  │     └─ VideoUpload.jsx
│  │  ├─ context
│  │  │  ├─ AppContext.jsx
│  │  │  ├─ AuthContext.jsx
│  │  │  └─ ThemeContext.jsx
│  │  ├─ hooks
│  │  │  ├─ useApi.js
│  │  │  ├─ useAuth.js
│  │  │  ├─ useDebounce.js
│  │  │  ├─ useIntersection.js
│  │  │  ├─ useLocalStorage.js
│  │  │  ├─ useTheme.js
│  │  │  └─ useTimer.js
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ About.jsx
│  │  │  ├─ Chatbot.jsx
│  │  │  ├─ Contact.jsx
│  │  │  ├─ Dashboard.jsx
│  │  │  ├─ Home.jsx
│  │  │  ├─ Login.jsx
│  │  │  ├─ Materials.jsx
│  │  │  ├─ News.jsx
│  │  │  ├─ NotFound.jsx
│  │  │  ├─ Payment.jsx
│  │  │  ├─ Practice.jsx
│  │  │  ├─ Signup.jsx
│  │  │  └─ Videos.jsx
│  │  ├─ services
│  │  │  ├─ api.js
│  │  │  ├─ authService.js
│  │  │  └─ utils.js
│  │  └─ styles
│  │     └─ globals.css
│  ├─ tailwind.config.js
│  └─ vite.config.js
├─ README.md
└─ server
   ├─ .env
   ├─ package-lock.json
   ├─ package.json
   ├─ prisma
   │  ├─ migrate.js
   │  ├─ schema.prisma
   │  └─ seed.js
   ├─ server.js
   ├─ src
   │  ├─ app.js
   │  ├─ config
   │  │  ├─ aws-s3.js
   │  │  ├─ cloudinary.js
   │  │  ├─ database.js
   │  │  ├─ openai.js
   │  │  └─ paystack.js
   │  ├─ controllers
   │  │  ├─ adminController.js
   │  │  ├─ adminPaymentController.js
   │  │  ├─ authController.js
   │  │  ├─ chatbotController.js
   │  │  ├─ newsController.js
   │  │  ├─ paymentController.js
   │  │  ├─ pdfController.js
   │  │  ├─ practiceController.js
   │  │  ├─ userController.js
   │  │  └─ videoController.js
   │  ├─ middleware
   │  │  ├─ auth.js
   │  │  ├─ roleCheck.js
   │  │  ├─ upload.js
   │  │  └─ validation.js
   │  ├─ routes
   │  │  ├─ admin.js
   │  │  ├─ auth.js
   │  │  ├─ chatbot.js
   │  │  ├─ news.js
   │  │  ├─ payments.js
   │  │  ├─ pdfs.js
   │  │  ├─ practice.js
   │  │  ├─ users.js
   │  │  └─ videos.js
   │  ├─ services
   │  │  ├─ emailService.js
   │  │  ├─ fileService.js
   │  │  ├─ openaiService.js
   │  │  ├─ paymentService.js
   │  │  └─ questionService.js
   │  └─ utils
   │     ├─ constants.js
   │     ├─ createLimiter.js
   │     ├─ helpers.js
   │     ├─ pdfGenerator.js
   │     └─ validators.js
   └─ temp

```