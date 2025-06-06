add this code to your web site

```
<script>
document.addEventListener("click", function(event) {
    const clickData = {
        url: window.location.href,
        x: event.clientX,
        y: event.clientY,
        timestamp: new Date().toISOString()
    };

    fetch("https://dein-server.de/click-data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(clickData)
    });
});
</script>
```
