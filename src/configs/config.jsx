
const quizStartTime = {
    hour:16,
    minute:0,
    second: 0
  };

  
  const questions = [
    { 
      "id": 1, 
      "title": "Question 1", 
      "content": "What comes next in the sequence? 2, 6, 12, 20, 30, ?", 
      "imageUrl":"https://firebasestorage.googleapis.com/v0/b/acm-fy-rep-login.appspot.com/o/ES_1.png?alt=media&token=8c6d1c0a-0a4d-49e3-bdae-2965d0f3af0f",
      "correctAnswer": import.meta.env.VITE_APP_ANSWER_1_KEY 
  },
  { 
      "id": 2, 
      "title": "Question 2", 
      "content": "If CLOUD is written as DMPVE, how will RAIN be written?", 
      "correctAnswer": import.meta.env.VITE_APP_ANSWER_2_KEY
  },
  { 
      "id": 3, 
      "title": "Question 3", 
      "content": "Pointing to a girl, Rahul said, 'She is the only daughter of my father’s only son.' How is the girl related to Rahul?", 
      "correctAnswer": import.meta.env.VITE_APP_ANSWER_3_KEY
  },
  { 
      "id": 4, 
      "title": "Question 4", 
      "content": "A clock shows the time as 4:15 PM. If the minute hand moves 90 degrees clockwise, what will be the new time?", 
      "correctAnswer": import.meta.env.VITE_APP_ANSWER_4_KEY
  },
  { 
      "id": 5, 
      "title": "Question 5", 
      "content": "Statements: 1. Some engineers are mathematicians. 2. All mathematicians are scientists. Conclusions: I. Some engineers are scientists. II. All scientists are engineers. Which conclusion follows?", 
      "correctAnswer": import.meta.env.VITE_APP_ANSWER_5_KEY
  },
  { 
      "id": 6, 
      "title": "Question 6", 
      "content": "A father is 4 times as old as his son. After 8 years, he will be twice as old as his son. What is the father's current age?", 
      "correctAnswer": import.meta.env.VITE_APP_ANSWER_6_KEY 
  }
  ];


  export {questions, quizStartTime};