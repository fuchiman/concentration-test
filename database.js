// =========================================
// database.js
// Ver2.0 Part1
// =========================================

// =========================================
// 定数
// =========================================

const MIN_NUMBER = 1;
const MAX_NUMBER = 19;

const MIN_SUM = 5;
const MAX_SUM = 20;

// =========================================
// データベース
// =========================================

// 全184問
const questionDatabase = [];

// 和ごとの問題
const questionsBySum = {};

// =========================================
// 初期化
// =========================================

for (let sum = MIN_SUM; sum <= MAX_SUM; sum++) {

    questionsBySum[sum] = [];

}

// =========================================
// 問題生成
// =========================================

let questionId = 0;

for (let a = MIN_NUMBER; a <= MAX_NUMBER; a++) {

    for (let b = MIN_NUMBER; b <= MAX_NUMBER; b++) {

        const sum = a + b;

        if (sum < MIN_SUM || sum > MAX_SUM) {

            continue;

        }

        const question = {

            questionId,

            a,

            b,

            sum,

            text: `${a}+${b}`

        };

        questionDatabase.push(question);

        questionsBySum[sum].push(question);

        questionId++;

    }

}

// =========================================
// デバッグ
// =========================================

console.log("========== DATABASE ==========");

console.log("問題数");

console.log(questionDatabase.length);

console.log("和ごとの問題");

console.log(questionsBySum);

console.log("最大QuestionID:", questionDatabase.at(-1).questionId);

console.log("==============================");