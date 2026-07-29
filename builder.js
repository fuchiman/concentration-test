// =========================================
// builder.js
// Ver2.0 Part2
// 候補プール生成
// =========================================

// -----------------------------------------
// 配列をシャッフル
// -----------------------------------------
function shuffle(array) {

    const copied = [...array];

    for (let i = copied.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [copied[i], copied[j]] = [copied[j], copied[i]];

    }

    return copied;

}

// -----------------------------------------
// ランダムに1つ取得
// -----------------------------------------
function randomChoice(array) {

    if (array.length === 0) {

        throw new Error("候補がありません。");

    }

    return array[
        Math.floor(Math.random() * array.length)
    ];

}

// =========================================
// 正解候補
// =========================================

function getCorrectPool(question) {

    return questionsBySum[question.sum].filter(candidate => {

        // 同じ問題は禁止
        if (
            candidate.a === question.a &&
            candidate.b === question.b
        ) {
            return false;
        }

        // 順番を入れ替えただけも禁止
        if (
            candidate.a === question.b &&
            candidate.b === question.a
        ) {
            return false;
        }

        return true;

    });

}

// =========================================
// Near候補
// （和±1のみ）
// =========================================

function getNearPool(question) {

    const pool = [];

    if (question.sum > MIN_SUM) {

        pool.push(...questionsBySum[question.sum - 1]);

    }

    if (question.sum < MAX_SUM) {

        pool.push(...questionsBySum[question.sum + 1]);

    }

    return pool;

}

// =========================================
// Far候補
// （和の差4以上）
// =========================================

function getFarPool(question) {

    const pool = [];

    for (let sum = MIN_SUM; sum <= MAX_SUM; sum++) {

        if (Math.abs(sum - question.sum) >= 4) {

            pool.push(...questionsBySum[sum]);

        }

    }

    return pool;

}

// =========================================
// 1問生成
// =========================================

function buildQuestion(question, correctPosition) {

    // -----------------------------
    // 候補取得
    // -----------------------------

    const correctPool = getCorrectPool(question);
    const nearPool = getNearPool(question);
    const farPool = getFarPool(question);

    // -----------------------------
    // ランダム選択
    // -----------------------------

    const correct = randomChoice(correctPool);

    const near = randomChoice(
        nearPool.filter(candidate =>

            candidate.questionId !== correct.questionId

        )
    );

    const far = randomChoice(
        farPool.filter(candidate =>

            candidate.questionId !== correct.questionId &&
            candidate.questionId !== near.questionId

        )
    );

    // -----------------------------
    // 選択肢作成
    // -----------------------------

    const choices = [

        {
            text: near.text,
            question: near,
            type: "near"
        },

        {
            text: correct.text,
            question: correct,
            type: "correct"
        },

        {
            text: far.text,
            question: far,
            type: "far"
        }

    ];

    // -----------------------------
    // 正解位置変更
    // -----------------------------

    [choices[1], choices[correctPosition]] =
        [choices[correctPosition], choices[1]];

    // -----------------------------
    // 完成
    // -----------------------------

    return {

        questionId: question.questionId,

        question,

        choices,

        correctIndex: correctPosition

    };

}

// =========================================
// 実験データ生成
// =========================================

function buildExperiment() {

    // -----------------------------
    // 問題順をシャッフル
    // -----------------------------

    const shuffledQuestions = shuffle(questionDatabase);

    // -----------------------------
    // 正解位置
    // 0=上 1=中 2=下
    // -----------------------------

    const correctPositions = [];

    // 184問
    // 上61・中61・下62

    for (let i = 0; i < 61; i++) {

        correctPositions.push(0);
        correctPositions.push(1);

    }

    for (let i = 0; i < 62; i++) {

        correctPositions.push(2);

    }

    const shuffledCorrectPositions = shuffle(correctPositions);

    // -----------------------------
    // 実験データ
    // -----------------------------

    const experiment = [];

    for (let i = 0; i < shuffledQuestions.length; i++) {

        experiment.push(

            buildQuestion(

                shuffledQuestions[i],

                shuffledCorrectPositions[i]

            )

        );

    }

    console.log(shuffledCorrectPositions);
    return experiment;

}