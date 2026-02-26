// mNeet PRO - Main App Initializer
console.log("mNeet PRO is initializing...");

document.addEventListener('DOMContentLoaded', () => {
    // Check if the user is online
    if (!navigator.onLine) {
        alert("Please check your internet connection!");
    }
});

// Prevent accidental refresh
window.onbeforeunload = function() {
    if (document.getElementById('quiz-active')) {
        return "You have an ongoing quiz! Are you sure?";
    }
};
