const test = async (stunServers) => {
  console.clear();
  console.log("start detecting!");
  console.log("stun servers are:", JSON.stringify(stunServers, null, 2));
  const rtcPeerConnection = new RTCPeerConnection({
    iceServers: stunServers.map((url) => ({
      urls: `stun:${url}`,
    })),
  });
  // line below is to make sure that you have the permission to access the microphone
  const tempStream = await navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: false,
    });
  tempStream.getTracks().forEach((track) => track.stop()); // 🔥 Stop immediately!

  const mediaStream = await navigator.mediaDevices
    .getUserMedia({
      video: false,
      audio: true,
    });
  mediaStream.getAudioTracks().forEach(
    (track) => {
      rtcPeerConnection.addTrack(track);
    },
  );

  const candidatePrinter = (event) => {
    if (event.candidate === null) {
      rtcPeerConnection.removeEventListener("icecandidate", candidatePrinter);
      console.log("All ICE candidates have been gathered");
      console.log("SDP:", rtcPeerConnection.localDescription.sdp);
      return;
    }
    console.log(event.candidate.candidate);
  };
  rtcPeerConnection.addEventListener("icecandidate", candidatePrinter);

  const offer = await rtcPeerConnection.createOffer({
    iceRestart: true,
  });
  await rtcPeerConnection.setLocalDescription(offer);
};

document.querySelector("button#test-1").addEventListener(
  "click",
  () => {
    test(["stun1.ringcentral.com:19302"]);
  },
);

document.querySelector("button#test-2").addEventListener(
  "click",
  () => {
    test(["stun2.ringcentral.com:19302"]);
  },
);

document.querySelector("button#test-3").addEventListener(
  "click",
  () => {
    test([
      "stun1.ringcentral.com:19302",
      "stun2.ringcentral.com:19302",
    ]);
  },
);
