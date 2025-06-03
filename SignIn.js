let form = document.querySelector("#form");

async function getIpAddress() {
  const response = await fetch('https://api.ipify.org?format=json');
  const data = await response.json();
  return data.ip;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let input = document.querySelector("#input").value.trim();
  let password = document.querySelector("#password").value;

  if (!input || !password) {
    Swal.fire({
      title: "Missing Fields",
      text: "Please fill in all details.",
      icon: "warning",
      confirmButtonText: "OK",
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
    return;
  }

  if (password.length < 8) {
    Swal.fire({
      title: "Invalid Password",
      text: "Enter a valid password (minimum 8 characters).",
      icon: "warning",
      confirmButtonText: "OK",
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
    return;
  }

  const ip = await getIpAddress();
  const data = {
    input: input,
    password: password,
    ipAddress: ip
  };

  try {
    const response = await fetch("https://localhost:7246/api/User", {
      headers: { 'Content-Type': 'application/json' },
      method: "POST",
      body: JSON.stringify(data)
    });

    const result = await response.json();

    await Swal.fire({
      title: "Server Response",
      text: result.message,
      icon: "info",
      confirmButtonText: "OK",
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });

    if (result.message.includes("2FA")) {
      document.querySelector("#twoFactorSection").style.display = "block";
      localStorage.setItem("loginInput", result.data.email);
      localStorage.setItem("ipAddress", ip);
      return;
    }

    if (result.message.includes("verify")) {
      await Swal.fire({
        title: "Email Verification",
        text: result.message,
        icon: "info",
        confirmButtonText: "Go to Verify",
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });
      window.location.href = "Verify.html";
      return;
    }

    if (!response.ok) {
      return;
    }

    handleToken(result.data);
  } catch (err) {
    console.error(err);
    Swal.fire({
      title: "Error",
      text: "An error occurred during login.",
      icon: "error",
      confirmButtonText: "OK",
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }
});

document.querySelector("#verifyCodeBtn").addEventListener("click", async () => {
  const code = document.querySelector("#twoFactorCode").value;
  const email = localStorage.getItem("loginInput");
  const ip = localStorage.getItem("ipAddress");

  const verifyData = {
    email: email,
    twoFactorCode: code,
    ipAddress: ip
  };

  try {
    const response = await fetch("https://localhost:7246/api/User/verify-2fa", {
      headers: { 'Content-Type': 'application/json' },
      method: "POST",
      body: JSON.stringify(verifyData)
    });

    const result = await response.json();

    if (!response.ok || result.data === null) {
      Swal.fire({
        title: "Invalid Code",
        text: result.message || "Invalid 2FA code.",
        icon: "error",
        confirmButtonText: "OK",
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });
      return;
    }

    handleToken(result.data);
  } catch (err) {
    console.error(err);
    Swal.fire({
      title: "Error",
      text: "An error occurred during verification.",
      icon: "error",
      confirmButtonText: "OK",
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }
});

function handleToken(token) {
  localStorage.setItem('token', token);
  const decoded = decodeJWT(token);
  const role = decoded['role'];

  if (role === 'App_Customer') {
    window.location.href = "Customer/dashboard.html";
  } else if (role === 'Admin') {
    window.location.href = "Admin/dashboard.html";
  } else if (role === 'App_BankOfficer') {
    window.location.href = "AccountOfficer/dashboard.html";
  } else {
    console.log("Invalid Role");
  }
}

function decodeJWT(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }
  const payload = parts[1];
  return JSON.parse(atob(payload));
}
