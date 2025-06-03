function goToSignUp()
{
    window.location.href = "SignUp.html"
}
function goToAbout()
{
    window.location.href = "About.html";
}
function goToSignIn()
{
    window.location.href = "SignIn.html";
}

 
document.addEventListener("DOMContentLoaded", () => {
    const boxes = document.querySelectorAll(".feature-box");
    boxes.forEach((box, index) => {
      box.style.setProperty('--i', index);
    });
  
    const revealOnScroll = () => {
      boxes.forEach(box => {
        const boxTop = box.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (boxTop < windowHeight - 100) {
          box.classList.add('visible');
        }
      });
    };
  
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); 
  });