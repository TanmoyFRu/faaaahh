/**
 * Creates pitch-shifted WAV files by rewriting the sample rate in the WAV header.
 * Lower sample rate → slower, deeper sound (less intense)
 * Higher sample rate → faster, higher-pitched sound (more intense)
 * The audio data itself is untouched — only the header rate changes.
 */

const fs = require("fs");

function pitchShiftWav(srcPath, dstPath, multiplier) {
  const buf = Buffer.from(fs.readFileSync(srcPath));

  // Read original sample rate (bytes 24-27, little endian)
  const originalRate = buf.readUInt32LE(24);
  const numChannels  = buf.readUInt16LE(22);
  const bitsPerSample = buf.readUInt16LE(34);

  // Calculate new values
  const newRate     = Math.round(originalRate * multiplier);
  const newByteRate = newRate * numChannels * (bitsPerSample / 8);
  const blockAlign  = buf.readUInt16LE(32); // stays the same

  // Write new values into a copy of the buffer
  buf.writeUInt32LE(newRate,     24);
  buf.writeUInt32LE(newByteRate, 28);
  // block align (32-33) does not change

  fs.writeFileSync(dstPath, buf);
  console.log(
    `${dstPath}: ${originalRate}Hz → ${newRate}Hz (x${multiplier}) | byte rate: ${newByteRate}`
  );
}

// Error tiers
// tier1 = 1 error → subtle, deeper FAAAH (0.65x → slower, lower pitch)
// tier2 = 2-4 errors → original FAAAH (1.0x)
// tier3 = 5+ errors → intense, squeaky FAAAH (1.5x → faster, higher pitch)
pitchShiftWav("media/faah.wav", "media/faah-low.wav",  0.65);
pitchShiftWav("media/faah.wav", "media/faah-mid.wav",  1.00);
pitchShiftWav("media/faah.wav", "media/faah-high.wav", 1.50);

// Warning tiers
// tier1 = 1 warning → gentle AA (0.72x)
// tier2 = 2+ warnings → more stressed AA (1.35x)
pitchShiftWav("media/aa.wav", "media/aa-low.wav",  0.72);
pitchShiftWav("media/aa.wav", "media/aa-high.wav", 1.35);

// Victory — slightly higher and brighter than normal aa
pitchShiftWav("media/aa.wav", "media/victory.wav", 1.20);

console.log("Done.");
