import { getQuizSubmissions } from './submissions.js';


saveQuiz();

async function saveQuiz() {
    const currentURL = window.location.href;
    const courseID = currentURL.split('courses/')[1].split('/')[0];
    const quizID = currentURL.split('quizzes/')[1].split('/')[0];
    const splittedURL = currentURL.split('/');
    const baseURL = `${splittedURL[0]}//${splittedURL[2]}/`;
    if (!courseID || !parseInt(courseID)) {
        console.error('Unable to retrieve course id');
    } else if (!quizID || !parseInt(quizID)) {
        console.error('Unable to retrieve quiz id');
    }
    const submissions = await getQuizSubmissions(courseID, quizID, baseURL);
};
