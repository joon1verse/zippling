/*
================================================================================
  1. 서버 액션 파일 (수정)
  파일 경로: app/[locale]/contact/actions.ts
  ('reply_to'를 'replyTo'로 수정했습니다.)
================================================================================
*/
'use server';

import { Resend } from 'resend';

// Resend 인스턴스를 생성합니다. API 키는 환경 변수에서 가져옵니다.
// .env.local 파일에 RESEND_API_KEY='YOUR_API_KEY' 형식으로 추가해야 합니다.
const resend = new Resend(process.env.RESEND_API_KEY);

// 폼 데이터를 받아 이메일을 전송하는 서버 액션입니다.
export async function sendContactEmail(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;

  // 입력값 유효성 검사
  if (!name || !email || !message) {
    return { success: false, error: 'All fields are required.' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Zippling Contact Form <contact@zippling.net>', // Resend에서 승인된 도메인 이메일로 변경 권장
      to: ['official@zippling.net'], // 실제 수신할 이메일 주소
      subject: `New Contact Form Submission from ${name}`,
      replyTo: email, // [수정] reply_to -> replyTo
      html: `
        <h1>New Inquiry from Zippling Website</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr />
        <h2>Message:</h2>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (exception) {
    console.error('Email Sending Exception:', exception);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}