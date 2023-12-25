export function cleanRes(res) {
    return res.substring(9);
}

export function getPointElements() {
    const pointHolders = document.querySelectorAll('.question_points_holder:not(#qsaver-clone)');
    let cleanPointHolders = [];

    // clean points
    for (let pointHolder of pointHolders) {
        const classList = pointHolder.parentElement.classList;
        for (let i = 0; i < classList.length; i++) {
            if (classList[i] == 'header') {
                cleanPointHolders.push(pointHolder);
                continue;
            }
        }
    }

    return cleanPointHolders;
}

export function isIncorrectChoice(el) {
    return el.parentElement.nextElementSibling.getAttribute('qsaver-status') == "incorrect-answer";
}

export function getQuestionIDs() {
    const questionIDs = []
    const questionTextEls = document.getElementsByClassName('original_question_text');
    for (let el of questionTextEls) {
        questionIDs.push(el.nextElementSibling.id.split('_')[1]);
    }
    return questionIDs;
}