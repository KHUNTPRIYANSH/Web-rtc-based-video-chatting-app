// import React, { useContext } from "react";

// export const PeerContext = React.createContext(null);
// export const usePeer = () => {
//   return useContext(PeerContext);
// };
// export const PeerProvider = (props) => {
//   return (
//     <PeerContext.Provider value={{ usePeer }}>
//       {props.children}
//     </PeerContext.Provider>
//   );
// };
class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
            ],
          },
        ],
      });
    }
  }

  async getAnswer(offer) {
    // a function che incoming call ne upadva mate
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }
  }
  async getOffer() {
    // a function che call karva mate from sender to receiver
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }
  async setLocalDescription(ans) {
    // aa function jyare incoming offer send thai jay and same ni taraf this ans madi jay pachi have same vada na ans ne apda local descriptiuon ma set karva mate che atle tunk ma same vada na call ne join karva mate
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }
}
export default new PeerService();
