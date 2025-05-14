const navToggle = document.getElementById("navToggle")
const navLinks = document.getElementById("navLinks")
const arrow = navToggle.querySelector(".arrow")

navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open")
  arrow.style.transform = navLinks.classList.contains("open") ? "rotate(180deg)" : "rotate(0deg)"
})
