import pkg from "agora-token";
import dotenv from "dotenv";

import sequelize from "../Database/MySql.js";

dotenv.config();

const { RtcTokenBuilder, RtcRole } = pkg; // Extract required functions

export const generateAgoraToken = (req, res) => {
  console.log("Incoming request body:", req.body);  // Log request body

  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  const channelName = req.body.channelName;
  const uid = req.body.uid || 0;
  const role = req.body.role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  if (!appId || !appCertificate || !channelName) {
    console.error("Error: Missing required parameters");
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTimestamp = currentTimestamp + expirationTimeInSeconds;

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpireTimestamp
    );

    res.json({ token, uid });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ error: "Failed to generate token", details: error.message });
  }
};

