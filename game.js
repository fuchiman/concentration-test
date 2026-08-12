// =========================================
// game.js
// Part1
// =========================================

// ---------- DOM ----------

// 被験者名は使用しない
//let participantName = "";

// =========================================
// 実験設定
// =========================================

// 音楽条件
const musicName = {
    A: "A",
    // B: "B",
    C: "C",
    // D: "D",
    silence: "無音"
};

const musicConditions = [
    "A",
    // "B",
    "C",
    // "D",
    "silence"
];

function shuffleArray(array) {

    const shuffled = [...array];

    for (
        let i = shuffled.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            shuffled[i],
            shuffled[j]
        ] = [
            shuffled[j],
            shuffled[i]
        ];
    }

    return shuffled;
}

let conditionIndex =
    Number(localStorage.getItem("conditionIndex"));

if (
    !Number.isInteger(conditionIndex) ||
    conditionIndex < 0 ||
    conditionIndex >= 3
) {
    conditionIndex = 0;

    localStorage.setItem(
        "conditionIndex",
        conditionIndex
    );
}

let conditionOrder =
    JSON.parse(
        localStorage.getItem("conditionOrder")
    );

if (
    !Array.isArray(conditionOrder) ||
    conditionOrder.length !== 3
) {

    conditionOrder =
        shuffleArray(musicConditions);

    localStorage.setItem(
        "conditionOrder",
        JSON.stringify(conditionOrder)
    );

}

let musicId = conditionOrder[conditionIndex];

// セット番号
let setNumber =
    Number(
        localStorage.getItem("setNumber")
    );

if (!setNumber || setNumber < 1) {

    setNumber = 1;

    localStorage.setItem(
        "setNumber",
        setNumber
    );

}

document.getElementById("setDisplay")
    .textContent =
    `セット数：${setNumber}`;

console.log(musicId);
console.log(conditionOrder);
console.log(conditionIndex);
console.log(setNumber);

// =========================================
// 条件確認ボタン
// =========================================

const conditionCheckButton =
    document.getElementById("conditionCheckButton");

const conditionInfo =
    document.getElementById("conditionInfo");

const conditionText =
    document.getElementById("conditionText");


conditionCheckButton.addEventListener("click", () => {

    const currentMusic = musicName[musicId];

    conditionText.textContent = currentMusic;

    conditionInfo.classList.toggle("hidden");

});

// =========================================
// 端末ID
// =========================================

let deviceId = localStorage.getItem("deviceId");

function generateDeviceId() {

    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
        "abcdefghijklmnopqrstuvwxyz" +
        "0123456789";

    const randomValues =
        new Uint32Array(16);

    crypto.getRandomValues(randomValues);

    return Array.from(randomValues, value =>
        chars[value % chars.length]
    ).join("");

}

if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem("deviceId", deviceId);
}

const copyIdButton = document.getElementById("copyIdButton");

copyIdButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(deviceId);

    copyIdButton.textContent = "コピーしました！";

    setTimeout(() => {
      copyIdButton.textContent = "アンケート回答用のIDをコピーする";
    }, 1500);

  } catch (error) {
    console.error("コピーに失敗しました:", error);
  }
});

console.log("Device ID:", deviceId);

// ダイアログ

const methodDialog = document.getElementById("methodDialog");

const showMethodButton =
  document.getElementById("showMethodButton");

const closeMethodButton =
  document.getElementById("closeMethodButton");

const closeMethodButton2 =
  document.getElementById("closeMethodButton2");


// 「実験の実施方法を見る」
showMethodButton.addEventListener("click", () => {
  methodDialog.showModal();
});


// ×ボタン
closeMethodButton.addEventListener("click", () => {
  methodDialog.close();
});


// 「閉じる」ボタン
closeMethodButton2.addEventListener("click", () => {
  methodDialog.close();
});

// 画面
const startScreen = document.getElementById("startScreen");
const countdown = document.getElementById("countdown");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");
const uploadScreen = document.getElementById("uploadScreen");

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

// =========================================
// GAS送信用URL
// =========================================

const GAS_URL =
    "https://script.google.com/macros/s/AKfycbz1Gef8Jx29F1iJYnmsVpnL_0g4SU1CyduzWtjV9_klMWJGna3WC-Qz-t5n9IzrM4n3RQ/exec";

// 通し番号
let trialNumber = 1;

// =========================================
// タイマー
// =========================================

let timeLimit = 50;

let startTime = 0;

let timerInterval = null;

// =========================================
// データ送信中のページ離脱防止
// =========================================

let isUploading = false;

window.addEventListener("beforeunload", (event) => {

    if (!isUploading) {
        return;
    }

    event.preventDefault();

    event.returnValue = "";

});

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
// GASへ実験結果をまとめて送信
// =========================================

async function sendResultsToGAS() {

    const response = await fetch(GAS_URL, {

        method: "POST",

        body: JSON.stringify({
            records: resultData
        })

    });

    const data = await response.json();

    if (!data.success) {

        throw new Error(
            data.error || "GASへの保存に失敗しました。"
        );

    }

    console.log(
        "GASへの送信完了:",
        data.count,
        "件"
    );

}

// =========================================
// ゲーム終了
// =========================================

async function finishGame() {

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

    //document.getElementById("resultParticipantName").textContent = participantName;

    document.getElementById("resultMusicId").textContent = musicName[musicId];

    document.getElementById("resultSetNumber").textContent =
    setNumber;


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

    // 送信中画面を表示
    isUploading = true;
    uploadScreen.classList.remove("hidden");

    try {

        // GASへの送信が終わるまで待つ
        await sendResultsToGAS();

        // 送信完了
        isUploading = false;
        console.log("データの保存が完了しました。");


        if (conditionIndex < 2) {

            // 次の条件へ
            conditionIndex++;

            localStorage.setItem(
                "conditionIndex",
                conditionIndex
            );

        } else {

            // =====================================
            // 5条件すべて終了
            // =====================================

            setNumber++;

            conditionIndex = 0;

            // 新しいセットなので、
            // 次の5条件を新しくシャッフルする
            conditionOrder =
                shuffleArray(musicConditions);

            localStorage.setItem(
                "setNumber",
                setNumber
            );

            localStorage.setItem(
                "conditionIndex",
                conditionIndex
            );

            localStorage.setItem(
                "conditionOrder",
                JSON.stringify(conditionOrder)
            );

        }

        // 結果画面を表示
        uploadScreen.classList.add("hidden");

    } catch (error) {

        console.error(
            "データ送信エラー:",
            error
        );

        isUploading = false;
        uploadScreen.classList.add("hidden");

        alert(
            "データの保存に失敗しました。\n\n" +
            "CSVを保存して、担当者に知らせてください。"
        );

    }

}

// =========================================
// スタートボタン
// =========================================

startButton.addEventListener("click", () => {

    //participantName = document.getElementById("participantName").value.trim();

    //musicId = document.getElementById("musicSelect").value;

    //setNumber = Number(document.getElementById("setNumber").value);

    // if(participantName === ""){

    //     alert("被験者名を入力してください。");
    //     return;

    // }

    // if(setNumber < 1 || !Number.isInteger(setNumber)){

    // alert("セット番号を入力してください。");

    // return;

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

        const correctAt = new Date();

        resultData.push({


            deviceId: deviceId,
            //participantName: participantName,
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
                Math.round(performance.now()-startTime),

            // 正解した瞬間の日時
            date:
                correctAt.toLocaleDateString("ja-JP"),
            time:
                correctAt.toLocaleTimeString("ja-JP")

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

// document
//     .getElementById("downloadCSV")
//     .addEventListener("click",exportCSV);
