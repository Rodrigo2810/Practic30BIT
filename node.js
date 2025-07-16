const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer'); 
const path = require('path');
const app = express();
const port = 3000;

const upload = multer();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public/')));

app.post('/api/contact', upload.none(), (req, res) => {
    const {email, phone, message, consent, captchaToken } = req.body;

    if (!email || !phone || !message || !consent) {
        return res.status(400).json({ 
            success: false, 
            message: 'Пожалуйста, заполните все обязательные поля' 
        });
    }

    
    if (!captchaToken) {
        return res.status(400).json({ 
            success: false, 
            message: 'Пожалуйста, пройдите проверку капчи' 
        });
    }

    console.log("Получены новые данные формы:");
    console.log("Email: ", email);
    console.log("Телефон: ", phone);
    console.log("Сообщение: ", message);
    console.log("Согласие на обработку: ", consent);
    console.log("Капча токен:", captchaToken);

    res.json({ 
        success: true, 
        message: 'Форма успешно отправлена! Мы свяжемся с вами в ближайшее время.' 
    });
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});