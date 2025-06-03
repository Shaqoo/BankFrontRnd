let form2 = document.querySelector('#signupbox2');

form2.addEventListener('submit', (e) => {
  e.preventDefault();

  const nin = document.querySelector('#nin').value.trim();
  const bvn = document.querySelector('#bvn').value.trim();
  const dob = document.querySelector('#dob').value.trim();
  const phone = document.querySelector('#phone').value.trim();

  if (!nin || !bvn || !dob || !phone) {
    return Swal.fire({
      icon: 'warning',
      title: 'Incomplete Form',
      text: 'Fill in every detail before going to the next page.',
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    });
  }

  // Validate length: adjust these numbers based on your exact requirements
  if (nin.length !== 11) {
    return Swal.fire({
      icon: 'error',
      title: 'Invalid NIN',
      text: 'NIN must be exactly 11 digits.',
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    });
  }

  if (bvn.length !== 11) {
    return Swal.fire({
      icon: 'error',
      title: 'Invalid BVN',
      text: 'BVN must be exactly 11 digits.',
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    });
  }

  if (phone.length < 10 || phone.length > 15) {
    return Swal.fire({
      icon: 'error',
      title: 'Invalid Phone Number',
      text: 'Phone number must be between 10 and 15 digits.',
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    });
  }

  // Age check
  const doB = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - doB.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > doB.getMonth() ||
    (today.getMonth() === doB.getMonth() && today.getDate() >= doB.getDate());

  const actualAge = hasHadBirthdayThisYear ? age : age - 1;

  if (actualAge < 18) {
    return Swal.fire({
      icon: 'error',
      title: 'Underage',
      text: 'You must be at least 18 years old.',
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    });
  }

  // If all good, store and redirect
  localStorage.setItem("NIN", nin);
  localStorage.setItem("BVN", bvn);
  localStorage.setItem("Date", dob);
  localStorage.setItem("Phone", phone);

  Swal.fire({
    icon: 'success',
    title: 'Details saved!',
    text: 'Redirecting to next page...',
    timer: 1500,
    showConfirmButton: false,
    showClass: { popup: 'animate__animated animate__fadeInDown' },
    hideClass: { popup: 'animate__animated animate__fadeOutUp' }
  }).then(() => {
    window.location.href = "Page3.html";
  });
});
