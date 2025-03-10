import fastify from "fastify";
import Mailgun from "mailgun.js";
import formData from "form-data";
import dotenv from "dotenv";
import cors from "@fastify/cors";

dotenv.config();

if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
  throw new Error(
    "Configuração inválida: MAILGUN_API_KEY ou MAILGUN_DOMAIN ausente."
  );
}

const app = fastify();

type NodeMail = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type"],
});

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

app.post("/send-email", async (request, response) => {
  try {
    const { from, to, subject, text, html } = request.body as NodeMail;
    const domain = process.env.MAILGUN_DOMAIN;

    await mg.messages.create(domain, { from, to, subject, text, html });

    console.log("✅ Email enviado com sucesso!");
    return response.status(200).send({ message: "Email enviado com sucesso" });
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    return response.status(500).send({ error: "Erro ao enviar email" });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen({ host: "0.0.0.0", port: PORT }).then(() => {
  console.log(`🚀 Servidor Funcionando ${PORT}`);
});
