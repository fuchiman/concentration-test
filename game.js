// =========================================
// game.js
// Part1
// =========================================

// ---------- DOM ----------

let participantName = "";
let musicId = "";

// 画面
const startScreen = document.getElementById("startScreen");
const countdown = document.getElementById("countdown");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

// ボタン
const startButton = document.getElementById("startButton");

// タイマー
const timerDisplay = document.getElementById("timer");

// 左
const leftQuestion = document.getElementById("leftQuestion");

const leftButtons = [
    document.getElementById("leftChoice0"),
    document.getElementById("leftChoice1"),
    document.getElementById("leftChoice2")
];

// 右
const rightQuestion = document.getElementById("rightQuestion");

const rightButtons = [
    document.getElementById("rightChoice0"),
    document.getElementById("rightChoice1"),
    document.getElementById("rightChoice2")
];

// =========================================
// 実験データ生成
// =========================================

const leftExperiment = buildExperiment();
const rightExperiment = buildExperiment();

// =========================================
// 現在位置
// =========================================

let leftIndex = 0;
let rightIndex = 0;

// =========================================
// 現在の問題の記録
// =========================================

let leftMistakeCount = 0;
let rightMistakeCount = 0;

let leftMistakeHistory = [];
let rightMistakeHistory = [];

// =========================================
// 記録用
// =========================================

let leftCorrect = 0;
let rightCorrect = 0;

let leftMiss = 0;
let rightMiss = 0;

// CSV保存用
const resultData = [];

// 通し番号
let trialNumber = 1;

// =========================================
// タイマー
// =========================================

let timeLimit = 50;

let startTime = 0;

let timerInterval = null;

// =========================================
// 問題表示
// =========================================

function showQuestion(side){

    const experiment =
        side === "left"
        ? leftExperiment
        : rightExperiment;

    const index =
        side === "left"
        ? leftIndex
        : rightIndex;

    const data = experiment[index];

    const questionElement =
        side === "left"
        ? leftQuestion
        : rightQuestion;

    const buttons =
        side === "left"
        ? leftButtons
        : rightButtons;

    // 問題
    questionElement.textContent = data.question.text;

    // 選択肢
    for(let i=0;i<3;i++){

        buttons[i].textContent = data.choices[i].text;
        buttons[i].style.visibility = "visible";

    }

    // 出題時刻
    if(side === "left"){

        leftQuestionStart = performance.now();

    }else{

        rightQuestionStart = performance.now();

    }

    // 誤答情報リセット

    if(side==="left"){

        leftMistakeCount = 0;
        leftMistakeHistory = [];

    }else{

        rightMistakeCount = 0;
        rightMistakeHistory = [];

    }

}

// =========================================
// カウントダウン開始
// =========================================

function startCountdown() {

    startScreen.classList.add("hidden");
    countdown.classList.remove("hidden");

    let count = 3;
    countdown.textContent = count;

    const interval = setInterval(() => {

        count--;

        if (count > 0) {

            countdown.textContent = count;

        } else {

            clearInterval(interval);

            countdown.classList.add("hidden");

            startGame();

        }

    }, 1000);

}

// =========================================
// ゲーム開始
// =========================================

function startGame() {

    gameScreen.classList.remove("hidden");

    // 音楽開始
    playMusic();

    // 最初の問題を表示
    showQuestion("left");
    showQuestion("right");

    // 開始時刻
    startTime = performance.now();

    // タイマー開始
    startTimer();

}

// =========================================
// タイマー
// =========================================

function startTimer() {

    const start = performance.now();

    timerInterval = setInterval(() => {

        const elapsed = (performance.now() - start) / 1000;

        const remain = Math.max(0, timeLimit - elapsed);

        timerDisplay.textContent = remain.toFixed(1);

        if (remain <= 0) {

            clearInterval(timerInterval);

            finishGame();

        }

    }, 50);

}

// =========================================
// ゲーム終了
// =========================================

function finishGame() {

    gameScreen.classList.add("hidden");

    resultScreen.classList.remove("hidden");

    const audio =
    document.getElementById("experimentAudio");

    audio.pause();
    audio.currentTime = 0;

    // 左右データ取得

    const leftData =
        resultData.filter(
            record => record.side === "left"
        );


    const rightData =
        resultData.filter(
            record => record.side === "right"
        );


    // 平均反応時間

    const leftAverageReaction =
        leftData.length > 0
        ?
        Math.round(
            leftData.reduce(
                (sum, record)=>
                    sum + record.reactionTime,
                0
            )
            /
            leftData.length
        )
        :
        0;


    const rightAverageReaction =
        rightData.length > 0
        ?
        Math.round(
            rightData.reduce(
                (sum, record)=>
                    sum + record.reactionTime,
                0
            )
            /
            rightData.length
        )
        :
        0;


    // 表示

    document.getElementById("finalLeftScore")
    .textContent = leftCorrect;


    document.getElementById("finalRightScore")
    .textContent = rightCorrect;


    document.getElementById("finalLeftReaction")
    .textContent =
        leftAverageReaction;


    document.getElementById("finalRightReaction")
    .textContent =
        rightAverageReaction;


    document.getElementById("finalLeftMiss")
    .textContent =
        leftMiss;


    document.getElementById("finalRightMiss")
    .textContent =
        rightMiss;

    console.log(resultData);

}

// =========================================
// スタートボタン
// =========================================

startButton.addEventListener("click", () => {

    participantName =
        document.getElementById("participantName").value.trim();

    musicId =
        document.getElementById("musicSelect").value;

    if(participantName === ""){

        alert("被験者名を入力してください。");
        return;

    }

    // if(musicId === ""){

    //     alert("音楽IDを入力してください。");
    //     return;

    // }

    startCountdown();

});

// =========================================
// 1問の開始時刻
// =========================================

let leftQuestionStart = 0;
let rightQuestionStart = 0;

// =========================================
// 回答処理
// =========================================

function answer(side, choiceIndex){

    const experiment =
        side === "left"
        ? leftExperiment
        : rightExperiment;

    const index =
        side === "left"
        ? leftIndex
        : rightIndex;

    const data = experiment[index];

    const buttons =
        side === "left"
        ? leftButtons
        : rightButtons;

    const reactionTime =
        performance.now()
        -
        (
            side==="left"
            ? leftQuestionStart
            : rightQuestionStart
        );

    // --------------------------
    // 正解
    // --------------------------

    if(choiceIndex === data.correctIndex){

        resultData.push({

            participantName: participantName,
            musicId: musicId,
            trial: trialNumber++,

            side:side,

            questionId:data.question.questionId,

            question:data.question.text,

            sum:data.question.sum,

            correctExpression:
                data.choices[data.correctIndex].text,

            nearExpression:
                data.choices.find(c=>c.type==="near").text,

            farExpression:
                data.choices.find(c=>c.type==="far").text,

            correctPosition:data.correctIndex,

            reactionTime:Math.round(reactionTime),

            mistakeCount:
                side==="left"
                ? leftMistakeCount
                : rightMistakeCount,

            mistakeHistory:
                side==="left"
                ? (
                    leftMistakeHistory.length === 0
                        ? "none"
                        : leftMistakeHistory.join(">")
                )
                : (
                    rightMistakeHistory.length === 0
                        ? "none"
                        : rightMistakeHistory.join(">")
                ),

            timestamp:
                Math.round(performance.now()-startTime)

        });

        if(side==="left"){

            leftCorrect++;
            leftIndex++;

            if(leftIndex>=leftExperiment.length){

                leftIndex=0;

            }

        }else{

            rightCorrect++;
            rightIndex++;

            if(rightIndex>=rightExperiment.length){

                rightIndex=0;

            }

        }

        buttons.forEach(button => {

            button.style.visibility = "hidden";

        });

        setTimeout(()=>{

            showQuestion(side);

        },30);

    }

    // --------------------------
    // 不正解
    // --------------------------

    else{

        if(side==="left"){

            leftMiss++;

            leftMistakeCount++;

            leftMistakeHistory.push(
                data.choices[choiceIndex].type
            );

        }else{

            rightMiss++;

            rightMistakeCount++;

            rightMistakeHistory.push(
                data.choices[choiceIndex].type
            );

        }

        buttons[choiceIndex].style.visibility="hidden";

    }

}

// =========================================
// ボタンイベント
// =========================================

for(let i=0;i<3;i++){

    leftButtons[i].addEventListener("click",()=>{

        answer("left",i);

    });

    rightButtons[i].addEventListener("click",()=>{

        answer("right",i);

    });

}

function playMusic(){

    const audio =
        document.getElementById("experimentAudio");


    if(musicId === "silence"){

        return;

    }


    audio.src =
        "audio/" + musicId + ".mp3";


    audio.currentTime = 0;

    audio.play();

}

document
    .getElementById("downloadCSV")
    .addEventListener("click",exportCSV);
