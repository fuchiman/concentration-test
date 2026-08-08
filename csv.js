// =========================================
// CSV作成
// =========================================

function exportCSV() {

    const headers = [

        "participantName",
        "musicId",
        "trial",
        "side",
        "questionId",
        "question",
        "sum",
        "correctExpression",
        "nearExpression",
        "farExpression",
        "correctPosition",
        "reactionTime",
        "mistakeCount",
        "mistakeHistory",
        "timestamp"

    ];

    const rows = [];

    rows.push(headers.join(","));

    resultData.forEach(record => {

        rows.push([

            record.participantName,
            record.musicId,
            record.trial,
            record.side,
            record.questionId,
            record.question,
            record.sum,
            record.correctExpression,
            record.nearExpression,
            record.farExpression,
            record.correctPosition,
            record.reactionTime,
            record.mistakeCount,
            record.mistakeHistory,
            record.timestamp

        ]
        .map(escapeCSV)
        .join(","));

    });

    const csv = rows.join("\n");

    // Consoleへ出力
    console.log(csv);

    // ダウンロード
    const blob = new Blob(
        [csv],
        {type:"text/csv;charset=utf-8;"}
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    const now = new Date();

    const fileName =
        participantName
        + "_"
        + musicId
        + "_Set"
        + setNumber
        + "_" +
        now.getFullYear() +
        String(now.getMonth()+1).padStart(2,"0") +
        String(now.getDate()).padStart(2,"0") +
        "_" +
        String(now.getHours()).padStart(2,"0") +
        String(now.getMinutes()).padStart(2,"0") +
        String(now.getSeconds()).padStart(2,"0") +
        ".csv";

    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}

function escapeCSV(value){

    if(value === undefined || value === null){
        return "";
    }

    return `"${String(value).replace(/"/g,'""')}"`;
}
