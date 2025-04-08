
const quizStartTime = {
    hour:import.meta.env.VITE_APP_HOUR_KEY,
    minute: import.meta.env.VITE_APP_MINUTE_KEY,
    second: import.meta.env.VITE_APP_SECOND_KEY
  };

  
  const questions = [
    { 
      "id": 1, 
      "title": "Question 1", 
      "content": "2Functions", 
      "imageUrl":"https://firebasestorage.googleapis.com/v0/b/acm-fy-rep-login.appspot.com/o/2Functions.png?alt=media&token=7364b67f-02bd-43e1-87b1-0533cc518966",
      "correctAnswer": import.meta.env.VITE_APP_ANSWER_1_KEY 
  },
  { 
      "id": 2, 
      "title": "Question 2", 
      "content": "SortPaglu", 
      "imageUrl":"https://firebasestorage.googleapis.com/v0/b/acm-fy-rep-login.appspot.com/o/SortPaglu.png?alt=media&token=9db1adf8-ca54-40a3-8bad-86d833779c02",
      "correctAnswer": import.meta.env.VITE_APP_ANSWER_2_KEY
  },
  { 
      "id": 3, 
      "title": "Question 3", 
      "content": "GraphPaglu", 
      "imageUrl":"https://firebasestorage.googleapis.com/v0/b/acm-fy-rep-login.appspot.com/o/GraphPaglu.png?alt=media&token=e73496b4-ff64-4174-abcc-c57e9f290727",
      "correctAnswer": import.meta.env.VITE_APP_ANSWER_3_KEY
  },
  { 
      "id": 4, 
      "title": "Question 4", 
      "content": "CipherPaglu",
      "imageUrl":"https://firebasestorage.googleapis.com/v0/b/acm-fy-rep-login.appspot.com/o/CipherPaglu%20(2).png?alt=media&token=3695a223-b20b-4e91-8b1d-3e6916dde309",
      "correctAnswer": import.meta.env.VITE_APP_ANSWER_4_KEY
  },
  { 
      "id": 5, 
      "title": "Question 5", 
      "content": "TreePaglu",
      "imageUrl":"https://firebasestorage.googleapis.com/v0/b/acm-fy-rep-login.appspot.com/o/segmenttree.png?alt=media&token=0a5b7cd9-7861-40dc-b44b-d9fc0cf8cdf5", 
      "correctAnswer": import.meta.env.VITE_APP_ANSWER_5_KEY
  },
  { 
      "id": 6, 
      "title": "Question 6", 
      "content": "BrainRot Final Boss", 
      "imageUrl":"https://firebasestorage.googleapis.com/v0/b/acm-fy-rep-login.appspot.com/o/brainroty.png?alt=media&token=4e0e5690-00af-4660-bf67-0b6a965e44c7",
      "correctAnswer": import.meta.env.VITE_APP_ANSWER_6_KEY 
  },
  {
    id: 7,
    title:"Question 7",
    content:"Delivery Finale",
    imageUrl:"https://firebasestorage.googleapis.com/v0/b/acm-fy-rep-login.appspot.com/o/Last.png?alt=media&token=62143df1-afb1-4dcb-9cf1-5efde288e8a1",
    correctAnswer: import.meta.env.VITE_APP_ANSWER_7_KEY
  }
  ];


  export {questions, quizStartTime};