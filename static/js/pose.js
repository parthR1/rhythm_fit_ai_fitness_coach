document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("start-btn");
    if (btn) {
        btn.addEventListener("click", function () {
            const video = document.getElementById('video');

            async function setupCamera() {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = stream;
                await video.play();
            }

            async function runPoseDetection() {
                const pose = new Pose({
                    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
                });

                pose.setOptions({
                    modelComplexity: 1,
                    smoothLandmarks: true,
                    enableSegmentation: false,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });

                pose.onResults(results => {
                    const landmarks = results.poseLandmarks;
                    if (!landmarks) return;

                    const videoElem = document.getElementById('video');
                    // Indices for relevant landmarks
                    const leftWrist = landmarks[15];
                    const rightWrist = landmarks[16];
                    const nose = landmarks[0];
                    // Tree pose detection (left leg up)
                    const leftAnkle = landmarks[27];
                    const rightAnkle = landmarks[28];
                    const leftKnee = landmarks[25];
                    const rightKnee = landmarks[26];
                    const leftHip = landmarks[23];
                    const rightHip = landmarks[24];

                    // Check if left ankle is near right knee (tree pose, left leg up)
                    const ankleNearKnee =
                        Math.abs(leftAnkle.y - rightKnee.y) < 0.08 &&
                        Math.abs(leftAnkle.x - rightKnee.x) < 0.08;
                    // Check if right ankle is below both hips (standing on right leg)
                    const rightAnkleBelowHips =
                        rightAnkle.y > leftHip.y && rightAnkle.y > rightHip.y;
                    // (Optional) Check if wrists are above head and close together
                    const wristsAboveHead = leftWrist.y < nose.y && rightWrist.y < nose.y;
                    const wristsClose = Math.abs(leftWrist.x - rightWrist.x) < 0.1;

                    if (ankleNearKnee && rightAnkleBelowHips && wristsAboveHead && wristsClose) {
                        // Tree pose detected (left leg up)
                        if (videoElem) videoElem.classList.add("tree-pose");
                    } else {
                        if (videoElem) videoElem.classList.remove("tree-pose");
                    }
                });

                const camera = new Camera(video, {
                    onFrame: async () => {
                        await pose.send({ image: video });
                    },
                    width: 640,
                    height: 480
                });
                camera.start();
            }

            setupCamera().then(runPoseDetection);
        });
    }
});
