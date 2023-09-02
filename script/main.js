let music = null;
let soundEffects = {};
soundEffects[0] = new Audio('audio/rain01.mp3');
soundEffects[1] = new Audio('audio/rain02.mp3');
soundEffects[2] = new Audio('audio/rain03.mp3');
soundEffects[3] = new Audio('audio/rain04.mp3');
let cnt = 0;

//雨の音をならす
function play() {
    if (music == null || music.paused) {
        cnt++;
        music = soundEffects[cnt%4];
        music.play();
        playButton.classList.remove('fa-play');
        playButton.classList.add('fa-pause');
    } else {
        music.pause();
        playButton.classList.remove('fa-pause');
        playButton.classList.add('fa-play');
    }
}

//気象情報を取得
function rain(){
    // OpenWeatherMap APIキー
    const apiKey = 'APIKEY';
    // 位置情報（緯度と経度）
    const latitude = 35.6895; // 例: 東京の緯度
    const longitude = 139.6917; // 例: 東京の経度

    // API呼び出し
    const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.weather && data.weather[0] && data.weather[0].main === 'Rain') {
        console.log('降水があります');
        } else {
        console.log('降水はありません');
        }
    })
    .catch(error => {
        console.error('API呼び出しエラー:', error);
    });
}


//地図画面へ
function toMap() {
    window.location.href = "map.html";
}
  
//メイン画面へ
function toMain() {
    window.location.href = "index.html";
}

// YouTube動画のID（URLの最後の部分）を指定
var youtubeVideoId = 'pmTFyDvr4l4';

//Youtubeのモーダルウィンドウを上げる
function fadeinModal(youtubeid) {
    if (!youtubeid || youtubeid == "") return;
    console.log("modal-fadein:"+youtubeid);
    $(".modal").fadeIn();
    var youtubePlayer = document.getElementById('youtubePlayer');
    youtubePlayer.src = 'https://www.youtube.com/embed/' + youtubeid;
}

//Youtubeのモーダルウィンドウを閉じる
function fadeoutModal () {
    console.log("modal-fadeout");
    $(".modal").fadeOut();
    var youtubePlayer = document.getElementById('youtubePlayer');
    youtubePlayer.src = '';
  }
  

//地図データの取得用

let currentlatitude = 35.6895; // 例: 東京の緯度
let currentlongitude = 139.6917; // 例: 東京の経度
var map = null;
var cameraMarker = [];
var pin ;
var pin_video;
var pin_video_off;
var pin_video_on;

//地図の初期化
function initMap () {
    // 地図の初期化
    map = L.map('map').setView([currentlatitude, currentlongitude], 13); // 初期の中心座標とズームレベル

    // タイルレイヤーの追加（OpenStreetMapのデフォルトタイル）
    L.tileLayer('https://tile.mierune.co.jp/mierune_mono/{z}/{x}/{y}.png', {
        attribution: 'Maptiles by MIERUNE, Data by OpenStreetMap contributors'
    }).addTo(map);

    pin = L.icon({
        iconUrl: 'img/pin.png', // 新しいアイコン画像のパス
        iconSize: [32, 32], // アイコンのサイズ [幅, 高さ]
        iconAnchor: [16, 32], // アイコンのアンカー位置 [横, 縦]
    });
    pin_video = L.icon({
        iconUrl: 'img/pin_video.png', // 新しいアイコン画像のパス
        iconSize: [32, 32], // アイコンのサイズ [幅, 高さ]
        iconAnchor: [16, 32], // アイコンのアンカー位置 [横, 縦]
    });
    pin_video_off = L.icon({
        iconUrl: 'img/pin_video_off.png', // 新しいアイコン画像のパス
        iconSize: [32, 32], // アイコンのサイズ [幅, 高さ]
        iconAnchor: [16, 32], // アイコンのアンカー位置 [横, 縦]
    });
    pin_video_on = L.icon({
        iconUrl: 'img/pin_video_on.png', // 新しいアイコン画像のパス
        iconSize: [32, 32], // アイコンのサイズ [幅, 高さ]
        iconAnchor: [16, 32], // アイコンのアンカー位置 [横, 縦]
    });
}

//地図にカメラのピンを差す
function putCameraData(data) {
    //console.log(data);
    cameraMarker = [];
    var cnt = 0;
    for (var item of data) {
        if (item.youtubeid && item.youtubeid != "") {
            cameraMarker[cnt] = L.marker([item.lat, item.lon], { icon: pin_video }).addTo(map);
            cameraMarker[cnt].on('click',function(e) {  clickPinVideo(e); });
            cameraMarker[cnt].item = item;//ピンの情報をセットする
        } else {
            cameraMarker[cnt] = L.marker([item.lat, item.lon], { icon: pin_video_off }).addTo(map);
        }
        cnt++;
    }
}

//ピンをクリックイベントで発火する関数
function clickPinVideo(e){
    let item = e.target.item;
    console.log( item.title + " 住所："+ item.addr +" ID:"+ item.youtubeid);
    fadeinModal(item.youtubeid);
}

//現在地を取得する
function setCurrentLocation(){
    if ("geolocation" in navigator) {
        // ブラウザがGeolocation APIをサポートしているか確認

        // 位置情報を取得する関数
        navigator.geolocation.getCurrentPosition(function (position) {
            // 成功時のコールバック関数

            // 緯度と経度を取得
            //currentlatitude = position.coords.latitude;
            //currentlongitude = position.coords.longitude;

            //現在地にピンを差して移動する
            console.log("緯度: " + currentlatitude + ", 経度: " + currentlongitude);
            var marker = L.marker([currentlatitude, currentlongitude], { icon: pin }).addTo(map);
            map.panTo([latitude, longitude]);

        // ここで取得した位置情報を利用できます
        }, function (error) {
            // エラー時のコールバック関数
            switch (error.code) {
            case error.PERMISSION_DENIED:
            console.error("位置情報の利用が許可されていません。");
            break;
            case error.POSITION_UNAVAILABLE:
            console.error("位置情報が利用できません。");
            break;
            case error.TIMEOUT:
            console.error("位置情報の取得がタイムアウトしました。");
            break;
            case error.UNKNOWN_ERROR:
            console.error("不明なエラーが発生しました。");
            break;
            }
        });
    } else {
        console.error("ブラウザがGeolocation APIをサポートしていません。");
    }
}

//カメラデータの読み込み
var cameraData = null;
if (cameraData == null) {
    fetch('data/camera.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log("camera data is loaded");
        cameraData = data;
        nearbyCamera();//最も近いカメラを取得
        if (map != null) putCameraData(cameraData);//カメラデータの設定
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });    
}



// 現在地からもっとも近いカメラを取得
function nearbyCamera() {
    navigator.geolocation.getCurrentPosition(function (position) {
        // 現在の緯度経度を設定
        //currentlatitude = position.coords.latitude;
        //currentlongitude = position.coords.longitude;

        // 最も近い目的地とその距離を初期化
        var nearestCamera = null;
        var nearestDistance = Number.MAX_VALUE;
    
        // 各目的地までの距離を計算し、最も近い目的地を特定
        cameraData.forEach(function (camera) {
            var distance = calculateDistance(currentlatitude, currentlongitude, camera.lat, camera.lon);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestCamera = camera;
            }
        });
    
        // 最も近い目的地の情報を表示
        if (nearestCamera) {
            console.log('最も近い目的地:', nearestCamera.title);
            console.log('距離:', nearestDistance.toFixed(2), 'メートル');
            youtubeVideoId = nearestCamera.youtubeid;
        } else {
            console.log('近くの目的地はありません。');
        }
    });    
}


// 2つの緯度経度間の距離を計算する関数
function calculateDistance(lat1, lon1, lat2, lon2) {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515; // マイルをキロメートルに変換
    dist = dist * 1.609344; // キロメートルをメートルに変換
    return dist;
}

//一番近いカメラ
function changeNearCameraPin() {

}

