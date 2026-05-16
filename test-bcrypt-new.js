const bcrypt = require("bcryptjs");

const password = "Admin123456";
const hash = "$2b$10$WmN5M02.1LNLmUo8BIlflOAtFO3LC3tiBpjOuv9Zn2hdlOZBpoUj6";

async function test() {
  try {
    const match = await bcrypt.compare(password, hash);
    console.log("Password match:", match);
    if (match) {
      console.log("✅ Password is correct! Use this hash in the Sheet.");
    } else {
      console.log("❌ Password is incorrect!");
    }
  } catch (e) {
    console.error("❌ Bcrypt error:", e.message);
  }
}

test();