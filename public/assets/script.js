// Farming Products API - Interactive Scripts

document.addEventListener('DOMContentLoaded', function () {
    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add copy functionality to code blocks
    document.querySelectorAll('code').forEach(codeBlock => {
        codeBlock.addEventListener('click', function () {
            const text = this.textContent;
            navigator.clipboard.writeText(text).then(() => {
                // Show a temporary tooltip
                const tooltip = document.createElement('div');
                tooltip.textContent = 'Copied!';
                tooltip.style.cssText = `
                    position: fixed;
                    top: ${event.pageY - 30}px;
                    left: ${event.pageX}px;
                    background: #28a745;
                    color: white;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    z-index: 1000;
                    pointer-events: none;
                `;
                document.body.appendChild(tooltip);

                setTimeout(() => {
                    document.body.removeChild(tooltip);
                }, 1000);
            });
        });

        // Add cursor pointer to indicate clickable
        codeBlock.style.cursor = 'pointer';
        codeBlock.title = 'Click to copy';
    });

    // Add hover effects to endpoint cards
    document.querySelectorAll('.endpoint').forEach(endpoint => {
        endpoint.addEventListener('mouseenter', function () {
            this.style.transform = 'translateX(5px)';
            this.style.transition = 'transform 0.2s ease';
        });

        endpoint.addEventListener('mouseleave', function () {
            this.style.transform = 'translateX(0)';
        });
    });

    // Simulate API status check
    function checkAPIStatus() {
        const statusElement = document.querySelector('.status');
        if (statusElement) {
            // Simulate a status check
            fetch('/api/v2/health', { method: 'GET' })
                .then(response => {
                    if (response.ok) {
                        statusElement.innerHTML = '🟢 API Status: Online';
                        statusElement.style.background = '#28a745';
                    } else {
                        statusElement.innerHTML = '🟡 API Status: Limited';
                        statusElement.style.background = '#ffc107';
                    }
                })
                .catch(() => {
                    statusElement.innerHTML = '🔴 API Status: Offline';
                    statusElement.style.background = '#dc3545';
                });
        }
    }

    // Check API status on page load
    checkAPIStatus();

    // Add typing effect to the main heading
    const heading = document.querySelector('.header h1');
    if (heading) {
        const originalText = heading.textContent;
        heading.textContent = '';
        let i = 0;

        function typeWriter() {
            if (i < originalText.length) {
                heading.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }

        // Start typing effect after a short delay
        setTimeout(typeWriter, 500);
    }

    // Add parallax effect to the header
    window.addEventListener('scroll', function () {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('.header');
        if (header) {
            const rate = scrolled * -0.5;
            header.style.transform = `translateY(${rate}px)`;
        }
    });

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards and sections for animation
    document.querySelectorAll('.info-card, .feature, .tech-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add search functionality for endpoints
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search endpoints...';
    searchInput.style.cssText = `
        width: 100%;
        padding: 12px;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        font-size: 16px;
        margin-bottom: 20px;
        outline: none;
        transition: border-color 0.3s ease;
    `;

    searchInput.addEventListener('focus', function () {
        this.style.borderColor = '#667eea';
    });

    searchInput.addEventListener('blur', function () {
        this.style.borderColor = '#e9ecef';
    });

    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        const endpoints = document.querySelectorAll('.endpoint');

        endpoints.forEach(endpoint => {
            const text = endpoint.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                endpoint.style.display = 'block';
            } else {
                endpoint.style.display = 'none';
            }
        });
    });

    // Insert search input before endpoints section
    const endpointsSection = document.querySelector('.endpoints');
    if (endpointsSection) {
        endpointsSection.insertBefore(searchInput, endpointsSection.firstChild);
    }

    // Add a "Back to Top" button
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '↑';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s ease, transform 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    document.body.appendChild(backToTopButton);

    backToTopButton.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 300) {
            backToTopButton.style.opacity = '1';
        } else {
            backToTopButton.style.opacity = '0';
        }
    });

    backToTopButton.addEventListener('mouseenter', function () {
        this.style.transform = 'scale(1.1)';
    });

    backToTopButton.addEventListener('mouseleave', function () {
        this.style.transform = 'scale(1)';
    });
}); 