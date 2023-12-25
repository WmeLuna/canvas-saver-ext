import qt from './question_types.js';
import { getPointElements, isIncorrectChoice, getQuestionIDs } from './helpers.js';


export default function display(answers) {

   const questions = document.getElementsByClassName('question');
   const questionTypes = document.getElementsByClassName('question_type');
   const numQuestions = questions.length;
   const displayer = new Displayer();
   const pointHolders = getPointElements();
   const questionIDs = getQuestionIDs();

   for (let i = 0; i < numQuestions; i++) {
      const questionType = questionTypes[i].innerText;
      const questionID = questionIDs[i];

      if (answers[questionID]) {
         const answer = answers[questionID].bestAttempt;
         answer['attemptedAnswers'] = [];
         for (let attemptedAnswer of answers[questionID].attemptedAnswers) {
            if (attemptedAnswer.text != '') {
               answer.attemptedAnswers.push(attemptedAnswer.text);
            }
         }

         switch (questionType) {
            case qt.ESSAY_QUESTION:
               displayer.displayEssay(answer, questionID);
						case qt.MULTIPLE_DROPDOWN:
							 displayer.displayMultipleDropdown(answer, questionID)
							 break
            case qt.MATCHING:
               displayer.displayMatching(answer, questionID);
               break;
            case qt.MULTIPLE_ANSWER:
               displayer.displayMultipleAnswer(answer, questionID);
               break;
            case qt.MULTIPLE_CHOICE:
            case qt.TRUE_FALSE:
               displayer.displayMultipleChoise(answer, questionID);
               break;
            case qt.FILL_IN_BLANK:
            //case qt.FORMULA_QUESTION:
            case qt.NUMERICAL_ANSWER:
               displayer.displayFillInBlank(answer, questionID);
               break;
            case qt.FILL_IN_M_BLANK:
               displayer.displayFillInMultipleBlank(answer, questionID)
               break
         }

         const earnedPoints = Math.round(answer.points * 100) / 100;
         if (earnedPoints == parseFloat(pointHolders[i].innerText)) {
            pointHolders[i].setAttribute("qsaver-status","correct-answer");
         } else {
            pointHolders[i].setAttribute("qsaver-status","incorrect-answer");
         }
         pointHeader(pointHolders[i],`${earnedPoints}/`);
      } else {
				pointHeader(pointHolders[i], `(New Question) `);
      }
   }
}

//pointHeader(pointHolders[i], 'text')
function pointHeader (holder, pre) {
	let preEl = holder.parentNode.querySelector('#qsaver-clone')
	if (!preEl) {
		preEl = holder.cloneNode(true)
		preEl.id = 'qsaver-clone'
		holder.parentNode.insertBefore(preEl, holder.nextSibling)
	}
	preEl.innerText = pre
	preEl.setAttribute("qsaver-status", holder.getAttribute("qsaver-status"))
}

export class Displayer {
   displayMatching(answer, questionID) {
      if (!answer) {
         return;
      }
			if (!answer.correct) return

      for (let answerProperty in answer) {
         if (answerProperty.includes('answer_')) {
            const answerID = `question_${questionID}_${answerProperty}`;
            if (document.getElementById(answerID)) document.getElementById(answerID).value = answer[answerProperty];
         }
      }
   }
	 displayMultipleDropdown (answer, questionID) {
		if (!answer) {
			return;
	 	}
		if (!answer.correct) return
		for (let answerProperty in answer) {
			if (answerProperty.includes('answer_id')){
				const answerSelector = `select.question_input[name^="question_${questionID}"]:has(option[value="${answer[answerProperty]}"])`
				const el = document.querySelector(answerSelector)
				if (el) {
					el.value = answer[answerProperty]
				}
			}
		}
	 }

   displayMultipleAnswer(answer, questionID) {
      if (!answer) {
         return;
      }

      if (!answer.correct) return
      for (let answerProperty in answer) {
         if (answerProperty.includes('answer_')) {
            const answerID = `question_${questionID}_${answerProperty}`;
            const el = document.getElementById(answerID);
						if (el) {
               el.checked = parseInt(answer[answerProperty]);
               if (el.checked) el.parentElement.nextElementSibling.setAttribute("qsaver-status","correct-answer")
            }
         }
      }
   }

   displayMultipleChoise(answer, questionID) {
      if (!answer) {
         return;
      }


      if ('attemptedAnswers' in answer && answer.attemptedAnswers.length) {
         for (let answerID of answer.attemptedAnswers) {
            const answerIDStr = `question_${questionID}_answer_${answerID}`;
            const el = document.getElementById(answerIDStr)
            el.parentElement.nextElementSibling.setAttribute("qsaver-status","incorrect-answer");
         }
      }

      if (!('answer_id' in answer)) {
         return;
      }

      const answerID = `question_${questionID}_answer_${answer.answer_id}`;
      const el = document.getElementById(answerID);

      if (!el) {
         return;
      }

      if (!isIncorrectChoice(el)) {
         el.parentElement.nextElementSibling.setAttribute("qsaver-status","correct-answer")
         el.checked = true;
      }

      // if only one left, select it
      // if (!answer.correct === true) {
      //    const possibleAnswers = el.parentElement.parentElement.parentElement.parentElement.children;
      //    if (possibleAnswers.length - answer.attemptedAnswers.length === 1) {
      //       for (let answerEl of possibleAnswers) {
      //          const checkbox = answerEl.firstElementChild.firstElementChild.firstElementChild;
      //          if (!isIncorrectChoice(checkbox)) {
      //             checkbox.checked = true;
      //          }
      //       }
      //    }
      // }
   }

   displayFillInBlank(answer, questionID) {
      if (!answer) {
         return;
      }
			if (!answer.correct) return

      let element = null;
      const elements = document.getElementsByName(`question_${questionID}`);
      for (let el of elements) {
         if (el.tagName === 'INPUT') {
            element = el;
            break;
         }
      }

      element.value = answer.text;
   }

   displayEssay(answer, questionID) {
      if (!answer) {
         return;
      }

      let topParent;
      setTimeout(() => {
         try {
            topParent = document.getElementById(`question_${questionID}_question_text`);
            const parent = topParent.nextElementSibling.firstElementChild.children[2].firstElementChild.firstElementChild.children[1].firstElementChild;
            const iframe = parent.contentDocument ? parent.contentDocument : parent.contentWindow.document;
            iframe.getElementById('tinymce').innerHTML = answer.text;
         } catch (e) {
            topParent.innerHTML += `<p>${answer.text}</p>`;

         }
      }, 500);



   }

   displayFillInMultipleBlank(answer, questionID) {
      if (!answer) {
         return;
      }
			if (!answer.correct) return

      const topParent = document.getElementById(`question_${questionID}_question_text`);
      const inputs = topParent.querySelectorAll('input')
      const answerKeys = Object.keys(answer).filter(key => key.includes('answer_for'))

      if (answerKeys.length != inputs.length)
         return

      for (let i = 0; i < inputs.length; i++)
         inputs[i].value = answer[answerKeys[i]]
   }
}
