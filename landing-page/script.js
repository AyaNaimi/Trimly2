// Main JavaScript for landing page
(function() {
    'use strict';

    // State management
    let currentLang = localStorage.getItem('language') || 'en';
    let currentTheme = localStorage.getItem('theme') || 'light';

    // Initialize on DOM load
    document.addEventListener('DOMContentLoaded', function() {
        // Vérifier si l'utilisateur préfère des animations réduites
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            console.log('Animations réduites activées pour l\'accessibilité');
            // Réduire ou désactiver certaines animations
            document.documentElement.style.setProperty('--transition-fast', '0.05s');
            document.documentElement.style.setProperty('--transition-normal', '0.1s');
            document.documentElement.style.setProperty('--transition-slow', '0.15s');
        }
        
        initTheme();
        initLanguage();
        initNavbar();
        initMobileMenu();
        initScrollReveal();
        initCounters();
        initLottieAnimation();
        initSmoothScroll();
        initParallax();
    });

    // Theme Management
    function initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const html = document.documentElement;
        
        // Set initial theme
        html.setAttribute('data-theme', currentTheme);
        updateThemeIcon();
        
        themeToggle.addEventListener('click', function() {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            html.setAttribute('data-theme', currentTheme);
            localStorage.setItem('theme', currentTheme);
            updateThemeIcon();
            
            // Add animation
            this.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                this.style.transform = 'rotate(0deg)';
            }, 300);
        });
    }

    function updateThemeIcon() {
        const icon = document.querySelector('#themeToggle i');
        if (currentTheme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    // Language Management
    function initLanguage() {
        const langBtn = document.getElementById('langBtn');
        const langDropdown = document.getElementById('langDropdown');
        const currentLangSpan = document.getElementById('currentLang');
        
        // Set initial language
        currentLangSpan.textContent = currentLang.toUpperCase();
        updateContent(currentLang);
        
        // Toggle dropdown
        langBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            langDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            langDropdown.classList.remove('active');
        });
        
        // Language selection
        const langButtons = langDropdown.querySelectorAll('button');
        langButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const lang = this.getAttribute('data-lang');
                currentLang = lang;
                currentLangSpan.textContent = lang.toUpperCase();
                localStorage.setItem('language', lang);
                updateContent(lang);
                langDropdown.classList.remove('active');
                
                // Update HTML dir for RTL languages
                if (lang === 'ar') {
                    document.documentElement.setAttribute('dir', 'rtl');
                } else {
                    document.documentElement.setAttribute('dir', 'ltr');
                }
            });
        });
    }

    function updateContent(lang) {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const keys = key.split('.');
            let value = translations[lang];
            
            keys.forEach(k => {
                value = value[k];
            });
            
            if (value) {
                element.textContent = value;
            }
        });
    }

    // Navbar scroll effect
    function initNavbar() {
        const navbar = document.getElementById('navbar');
        let lastScroll = 0;
        
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            // Hide navbar on scroll down, show on scroll up
            if (currentScroll > lastScroll && currentScroll > 500) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
        });
    }

    // Mobile menu
    function initMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', function() {
                this.classList.toggle('active');
                navLinks.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });
        }
    }

    // Scroll reveal animations
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('[data-reveal]');
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.getAttribute('data-reveal-delay') || 0;
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, delay);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }

    // Animated counters
    function initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const count = parseFloat(target.getAttribute('data-count'));
                    const duration = 2000;
                    const increment = count / (duration / 16);
                    let current = 0;
                    
                    const updateCounter = () => {
                        current += increment;
                        if (current < count) {
                            if (count >= 1000) {
                                target.textContent = Math.floor(current).toLocaleString() + '+';
                            } else {
                                target.textContent = current.toFixed(1);
                            }
                            requestAnimationFrame(updateCounter);
                        } else {
                            if (count >= 1000) {
                                target.textContent = count.toLocaleString() + '+';
                            } else {
                                target.textContent = count.toFixed(1);
                            }
                        }
                    };
                    
                    updateCounter();
                    counterObserver.unobserve(target);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    // Lottie animation
    function initLottieAnimation() {
        const container = document.getElementById('catAnimation');
        
        if (container && typeof lottie !== 'undefined') {
            // Load the cat animation
            fetch('assets/cat-playing.json')
                .then(response => response.json())
                .then(animationData => {
                    lottie.loadAnimation({
                        container: container,
                        renderer: 'svg',
                        loop: true,
                        autoplay: true,
                        animationData: animationData
                    });
                })
                .catch(error => {
                    console.log('Lottie animation not loaded:', error);
                });
        }
    }

    // Smooth scroll
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const offsetTop = target.offsetTop - 72; // navbar height
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Parallax effect (adapté pour mobile)
    function initParallax() {
        const hero = document.querySelector('.hero');
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (hero) {
            const parallaxElements = hero.querySelectorAll('.gradient-orb');
            
            if (isMobile) {
                // Sur mobile, parallax plus subtil basé sur le scroll
                let ticking = false;
                
                window.addEventListener('scroll', function() {
                    if (!ticking) {
                        window.requestAnimationFrame(function() {
                            const scrolled = window.pageYOffset;
                            
                            parallaxElements.forEach((element, index) => {
                                const speed = 0.3 + (index * 0.1);
                                element.style.transform = `translateY(${scrolled * speed}px) scale(${1 - scrolled * 0.0005})`;
                            });
                            
                            ticking = false;
                        });
                        
                        ticking = true;
                    }
                });
                
                // Optionnel: effet gyroscope sur mobile
                if (window.DeviceOrientationEvent) {
                    window.addEventListener('deviceorientation', function(e) {
                        const beta = e.beta || 0;
                        const gamma = e.gamma || 0;
                        
                        parallaxElements.forEach((element, index) => {
                            const sensitivity = 0.5 + (index * 0.2);
                            const scrolled = window.pageYOffset;
                            element.style.transform = `
                                translateY(${scrolled * (0.3 + index * 0.1)}px) 
                                translateX(${gamma * sensitivity}px)
                                scale(${1 - scrolled * 0.0005})
                            `;
                        });
                    });
                }
            } else {
                // Desktop: parallax classique
                window.addEventListener('scroll', function() {
                    const scrolled = window.pageYOffset;
                    
                    parallaxElements.forEach((element, index) => {
                        const speed = 0.5 + (index * 0.2);
                        element.style.transform = `translateY(${scrolled * speed}px)`;
                    });
                });
            }
        }
    }

    // Floating cards animation (responsive pour mobile et desktop)
    function initFloatingCards() {
        const cards = document.querySelectorAll('.floating-card');
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        cards.forEach((card, index) => {
            let posX = 0;
            let posY = 0;
            let cardX = 0;
            let cardY = 0;
            
            if (isMobile) {
                // Mobile: Animation basée sur l'orientation de l'appareil (gyroscope)
                if (window.DeviceOrientationEvent) {
                    window.addEventListener('deviceorientation', function(e) {
                        // Beta: inclinaison avant/arrière (-180 à 180)
                        // Gamma: inclinaison gauche/droite (-90 à 90)
                        const beta = e.beta || 0;
                        const gamma = e.gamma || 0;
                        
                        posX = gamma / 90; // Normaliser entre -1 et 1
                        posY = (beta - 90) / 90; // Normaliser (position neutre = 90)
                    });
                } else {
                    // Fallback: animation basée sur le scroll
                    window.addEventListener('scroll', function() {
                        const scrollPercent = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
                        posX = Math.sin(scrollPercent * Math.PI * 2 + index) * 0.5;
                        posY = Math.cos(scrollPercent * Math.PI * 2 + index) * 0.5;
                    });
                }
                
                // Touch interactions
                let touchStartX = 0;
                let touchStartY = 0;
                
                document.addEventListener('touchmove', function(e) {
                    if (e.touches.length > 0) {
                        const touch = e.touches[0];
                        posX = (touch.clientX / window.innerWidth - 0.5) * 2;
                        posY = (touch.clientY / window.innerHeight - 0.5) * 2;
                    }
                });
            } else {
                // Desktop: Animation basée sur la souris
                document.addEventListener('mousemove', function(e) {
                    posX = e.clientX / window.innerWidth - 0.5;
                    posY = e.clientY / window.innerHeight - 0.5;
                });
            }
            
            function animate() {
                const multiplier = isMobile ? 15 : 20;
                cardX += (posX * multiplier - cardX) * 0.1;
                cardY += (posY * multiplier - cardY) * 0.1;
                
                card.style.transform = `translate(${cardX}px, ${cardY}px)`;
                requestAnimationFrame(animate);
            }
            
            animate();
        });
    }

    // Feature cards hover effect (desktop) and scroll-based effect (mobile)
    function initFeatureCards() {
        const featureCards = document.querySelectorAll('.feature-card');
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isMobile) {
            // Mobile: Animation basée sur la position dans le viewport
            function updateCardAnimations() {
                featureCards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    const cardCenter = rect.top + rect.height / 2;
                    const screenCenter = window.innerHeight / 2;
                    
                    // Distance du centre de l'écran (-1 à 1)
                    const distance = (cardCenter - screenCenter) / screenCenter;
                    
                    // Animation seulement si la carte est visible
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const scale = 1 - Math.abs(distance) * 0.1;
                        const translateY = distance * -10;
                        card.style.transform = `scale(${Math.max(0.9, scale)}) translateY(${translateY}px)`;
                        card.style.opacity = Math.max(0.5, 1 - Math.abs(distance) * 0.5);
                    }
                });
            }
            
            // Touch interactions pour effet de profondeur
            featureCards.forEach(card => {
                card.addEventListener('touchstart', function(e) {
                    const touch = e.touches[0];
                    const rect = this.getBoundingClientRect();
                    const x = touch.clientX - rect.left;
                    const y = touch.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = (y - centerY) / 15;
                    const rotateY = (centerX - x) / 15;
                    
                    this.style.transition = 'all 0.3s ease';
                    this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                });
                
                card.addEventListener('touchend', function() {
                    this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
                });
            });
            
            // Mise à jour au scroll
            let scrollTimeout;
            window.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(updateCardAnimations, 10);
            });
            
            updateCardAnimations();
        } else {
            // Desktop: Animation hover classique
            featureCards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transition = 'all 0.3s ease';
                });
                
                card.addEventListener('mousemove', function(e) {
                    const rect = this.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = (y - centerY) / 10;
                    const rotateY = (centerX - x) / 10;
                    
                    this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
                });
            });
        }
    }

    // Pricing cards interaction (avec effet ripple responsive)
    function initPricingCards() {
        const pricingCards = document.querySelectorAll('.pricing-card');
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        pricingCards.forEach(card => {
            const btn = card.querySelector('.pricing-btn');
            
            // Effet hover/touch sur la carte
            if (isMobile) {
                card.addEventListener('touchstart', function(e) {
                    const touch = e.touches[0];
                    const rect = this.getBoundingClientRect();
                    const x = touch.clientX - rect.left;
                    const y = touch.clientY - rect.top;
                    
                    // Effet de mise en avant basé sur la position du toucher
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const tiltX = (y - centerY) / 20;
                    const tiltY = (centerX - x) / 20;
                    
                    this.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
                });
                
                card.addEventListener('touchend', function() {
                    this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
                });
            }
            
            // Ripple effect sur le bouton
            const handleInteraction = function(e) {
                // Add ripple effect
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                
                // Position du ripple
                const rect = this.getBoundingClientRect();
                let x, y;
                
                if (e.type === 'touchstart') {
                    x = e.touches[0].clientX - rect.left;
                    y = e.touches[0].clientY - rect.top;
                } else {
                    x = e.clientX - rect.left;
                    y = e.clientY - rect.top;
                }
                
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
                
                // Show alert (replace with actual functionality)
                const planName = card.querySelector('h3').textContent;
                console.log(`Selected plan: ${planName}`);
            };
            
            btn.addEventListener('click', handleInteraction);
            if (isMobile) {
                btn.addEventListener('touchstart', handleInteraction);
            }
        });
    }

    // Testimonials slider (adapté pour touch et souris)
    function initTestimonialsSlider() {
        const slider = document.getElementById('testimonialsSlider');
        if (!slider) return;
        
        let isDown = false;
        let startX;
        let scrollLeft;
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Support souris (desktop)
        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
            slider.style.cursor = 'grabbing';
        });
        
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('active');
            slider.style.cursor = 'grab';
        });
        
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('active');
            slider.style.cursor = 'grab';
        });
        
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            slider.scrollLeft = scrollLeft - walk;
        });
        
        // Support tactile (mobile)
        let touchStartX = 0;
        let touchStartY = 0;
        let scrollStartLeft = 0;
        let isSwiping = false;
        
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            scrollStartLeft = slider.scrollLeft;
            isSwiping = false;
        }, { passive: true });
        
        slider.addEventListener('touchmove', (e) => {
            const touchCurrentX = e.touches[0].clientX;
            const touchCurrentY = e.touches[0].clientY;
            
            const deltaX = touchCurrentX - touchStartX;
            const deltaY = touchCurrentY - touchStartY;
            
            // Déterminer si c'est un swipe horizontal
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
                isSwiping = true;
                e.preventDefault(); // Empêcher le scroll vertical
                slider.scrollLeft = scrollStartLeft - deltaX;
            }
        }, { passive: false });
        
        slider.addEventListener('touchend', () => {
            isSwiping = false;
        });
        
        // Style du curseur pour desktop
        if (!isMobile) {
            slider.style.cursor = 'grab';
        }
    }

    // Cursor effect
    function initCursorEffect() {
        const cursor = document.createElement('div');
        cursor.classList.add('custom-cursor');
        document.body.appendChild(cursor);
        
        const cursorFollower = document.createElement('div');
        cursorFollower.classList.add('cursor-follower');
        document.body.appendChild(cursorFollower);
        
        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;
        let followerX = 0;
        let followerY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        function animate() {
            cursorX += (mouseX - cursorX) * 0.3;
            cursorY += (mouseY - cursorY) * 0.3;
            
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;
            
            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
            cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px)`;
            
            requestAnimationFrame(animate);
        }
        
        animate();
        
        // Hover effects
        const hoverElements = document.querySelectorAll('a, button, .feature-card, .pricing-card');
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                cursorFollower.classList.add('hover');
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                cursorFollower.classList.remove('hover');
            });
        });
    }

    // Particle background
    function initParticles() {
        const canvas = document.createElement('canvas');
        canvas.id = 'particles';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-1';
        canvas.style.opacity = '0.3';
        
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const particleCount = 50;
        
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
            }
            
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }
            
            draw() {
                ctx.fillStyle = currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(99, 102, 241, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        function init() {
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            // Connect particles
            particles.forEach((a, i) => {
                particles.slice(i + 1).forEach(b => {
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        ctx.strokeStyle = currentTheme === 'dark' 
                            ? `rgba(255, 255, 255, ${0.2 - distance / 500})` 
                            : `rgba(99, 102, 241, ${0.2 - distance / 500})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                });
            });
            
            requestAnimationFrame(animate);
        }
        
        init();
        animate();
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    // Loading animation
    function initLoadingAnimation() {
        const loader = document.createElement('div');
        loader.classList.add('page-loader');
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <p>Loading...</p>
            </div>
        `;
        document.body.appendChild(loader);
        
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.remove();
                }, 300);
            }, 500);
        });
    }

    // Initialize additional features
    initFloatingCards();
    initFeatureCards();
    initPricingCards();
    initTestimonialsSlider();
    
    // Optional: Uncomment for additional effects
    // initCursorEffect();
    // initParticles();
    // initLoadingAnimation();

    // Performance optimization: Debounce scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Add scroll progress indicator
    function initScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.classList.add('scroll-progress');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', debounce(() => {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.pageYOffset / windowHeight) * 100;
            progressBar.style.width = scrolled + '%';
        }, 10));
    }

    initScrollProgress();

    // Add ripple effect styles
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
            width: 20px;
            height: 20px;
            margin-left: -10px;
            margin-top: -10px;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .custom-cursor {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--primary-color);
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.2s ease;
        }
        
        .custom-cursor.hover {
            transform: scale(2);
        }
        
        .cursor-follower {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 2px solid var(--primary-color);
            position: fixed;
            pointer-events: none;
            z-index: 9998;
            transition: transform 0.3s ease;
        }
        
        .cursor-follower.hover {
            transform: scale(1.5);
        }
        
        .page-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--bg-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            transition: opacity 0.3s ease;
        }
        
        .loader-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid var(--border-color);
            border-top-color: var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
            .custom-cursor,
            .cursor-follower {
                display: none;
            }
        }
        
        /* Touch interactions - active states pour mobile */
        @media (hover: none) and (pointer: coarse) {
            .feature-card {
                transition: all 0.3s ease;
                will-change: transform;
            }
            
            .feature-card:active {
                transform: scale(0.98) !important;
            }
            
            .pricing-card {
                transition: all 0.3s ease;
                will-change: transform;
            }
            
            .pricing-card:active {
                transform: scale(0.98) !important;
            }
            
            .btn:active,
            .cta-btn:active,
            .pricing-btn:active {
                transform: scale(0.95) !important;
            }
            
            .testimonial-card {
                transition: all 0.3s ease;
            }
            
            .testimonial-card:active {
                transform: scale(0.98);
            }
            
            /* Smooth scrolling sur mobile */
            html {
                -webkit-overflow-scrolling: touch;
            }
            
            /* Touch feedback pour liens */
            a:active,
            button:active {
                opacity: 0.8;
                transition: opacity 0.15s ease;
            }
            
            /* Désactiver certains effets hover sur tactile */
            .nav-links a:hover::after {
                width: 0;
            }
        }
    `;
    document.head.appendChild(style);

})();
