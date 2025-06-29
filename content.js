function showTooltip(message) {


    const target = document.querySelector("#user-response");

    if (!target) {
        return;
    }

    console.log("Show tooltip(" + target + ", " + message + ")");

    document.querySelector(".my-tooltip")?.remove();

    console.log("Removed old tooltip");

    const tooltip = document.createElement("div");
    tooltip.className = "my-tooltip";
    tooltip.textContent = message;

    const rect = target.getBoundingClientRect();
    tooltip.style.top = `${rect.top + window.scrollY/* - 40*/}px`;

    let x = window.innerWidth / 2;
    x += target.value.length * 7;
    tooltip.style.left = `${x}px`;
    console.log(document.querySelector("#user-response").value);

    console.log("Appending tooltip")
    document.body.appendChild(tooltip);
    console.log("Appended tooltip")

    // setTimeout(() => tooltip.remove(), 3000);
}

// Listen for keypress
document.addEventListener("keydown", (e) => {
    setTimeout(() => {
        showTooltip("This is a kanji!");
    }, 1000);

    if (e.key === "Tab") {
        alert("You pressed Tab!");
    }
});
