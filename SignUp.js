let form1 = document.querySelector('#signupbox');

form1.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.querySelector('#email').value.trim();
  const username = document.querySelector('#username').value.trim();
  const address = document.querySelector('#address').value.trim();
  const fullname = document.querySelector('#fullname').value.trim();

  // Simple email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Alphabets only (allow spaces optionally in fullname)
  const alphaRegex = /^[A-Za-z\s]+$/;

  if (!email || !username || !address || !fullname) {
    return Swal.fire({
      icon: 'warning',
      title: 'Incomplete Form',
      text: 'Fill in every detail before going to the next page.',
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    });
  }

  if (!emailRegex.test(email)) {
    return Swal.fire({
      icon: 'error',
      title: 'Invalid Email',
      text: 'Please enter a valid email address.',
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    });
  }

  if (!alphaRegex.test(fullname)) {
    return Swal.fire({
      icon: 'error',
      title: 'Invalid Fullname',
      text: 'Fullname should contain only alphabets and spaces.',
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    });
  }

  if (!alphaRegex.test(username)) {
    return Swal.fire({
      icon: 'error',
      title: 'Invalid Username',
      text: 'Username should contain only alphabets.',
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    });
  }

  // If all validations pass, save to localStorage
  localStorage.setItem("Email", email);
  localStorage.setItem("Username", username);
  localStorage.setItem("Address", address);
  localStorage.setItem("Fullname", fullname);

  // Redirect after success popup
  Swal.fire({
    icon: 'success',
    title: 'All good!',
    text: 'Redirecting to next page...',
    timer: 1500,
    showConfirmButton: false,
    showClass: { popup: 'animate__animated animate__fadeInDown' },
    hideClass: { popup: 'animate__animated animate__fadeOutUp' }
  }).then(() => {
    window.location.href = "Page2.html";
  });
});
