const bcrypt = require("bcryptjs");

const password = "Admin123456";
const hash = "$2b$10$Q7l1vo3sLZsjRWlAp8vgMuwK4Rqs67Z83DOWZ71rw6GNfEoLJfTd.";

async function test() {
  try {
    const match = await bcrypt.compare(password, hash);
    console.log("Password match:", match);
    if (match) {
      console.log("✅ Password is correct!");
    } else {
      console.log("❌ Password is incorrect!");
    }
  } catch (e) {
    console.error("❌ Bcrypt error:", e.message);
  }
}

test();