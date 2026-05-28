/* ============================================================
   script.js — RblxStudio Portfolio
   Features: Navbar scroll, Mobile menu, Video modal, 
             Active nav highlight, Reveal animations, Form handler
   ============================================================ */

(function () {
    'use strict';

    /* ===================================================
       UTILITY HELPERS
       =================================================== */

    /**
     * Shorthand querySelector
     * @param {string} selector
     * @param {Element|Document} [scope=document]
     * @returns {Element|null}
     */
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    /**
     * Shorthand querySelectorAll returning real array
     * @param {string} selector
     * @param {Element|Document} [scope=document]
     * @returns {Element[]}
     */
    function qsa(selector, scope) {
        return Array.from((scope || document).querySelectorAll(selector));
    }

    /* ===================================================
       NAVBAR — SCROLL EFFECT
       Adds `.scrolled` class when page scrolls past 30px
       to enhance the frosted-glass shadow.
       =================================================== */
    (function initNavbarScroll() {
        var navbar = qs('#navbar');
        if (!navbar) return;

        var SCROLL_THRESHOLD = 30;

        function onScroll() {
            if (window.scrollY > SCROLL_THRESHOLD) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // run once on load in case page is already scrolled
    })();

    /* ===================================================
       MOBILE HAMBURGER MENU
       Toggles the nav-menu open/closed on small screens,
       and closes when a link is clicked.
       =================================================== */
    (function initMobileMenu() {
        var hamburger = qs('#hamburger');
        var navMenu = qs('#navMenu');
        if (!hamburger || !navMenu) return;

        function openMenu() {
            hamburger.classList.add('is-open');
            navMenu.classList.add('is-open');
            hamburger.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = '';
        }

        function closeMenu() {
            hamburger.classList.remove('is-open');
            navMenu.classList.remove('is-open');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        function toggleMenu() {
            var isOpen = navMenu.classList.contains('is-open');
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        }

        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.addEventListener('click', toggleMenu);

        // Close menu when any nav link is clicked
        var navLinks = qsa('.nav-link', navMenu);
        navLinks.forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });

        // Close menu when clicking outside of it
        document.addEventListener('click', function (event) {
            var isMenuOpen = navMenu.classList.contains('is-open');
            if (!isMenuOpen) return;

            var clickedInsideMenu = navMenu.contains(event.target);
            var clickedHamburger = hamburger.contains(event.target);
            if (!clickedInsideMenu && !clickedHamburger) {
                closeMenu();
            }
        });

        // Close menu on resize to desktop
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });
    })();

    /* ===================================================
       ACTIVE NAV LINK — SCROLL SPY
       Highlights the correct nav link based on which
       section is currently visible in the viewport.
       =================================================== */
    (function initScrollSpy() {
        var sections = qsa('section[id]');
        var navLinks = qsa('.nav-link');
        if (!sections.length || !navLinks.length) return;

        var OFFSET = 120; // pixels from top to trigger section change

        function updateActiveLink() {
            var scrollY = window.scrollY;
            var currentSectionId = '';

            sections.forEach(function (section) {
                var sectionTop = section.offsetTop - OFFSET;
                var sectionBottom = sectionTop + section.offsetHeight;

                if (scrollY >= sectionTop && scrollY < sectionBottom) {
                    currentSectionId = section.getAttribute('id');
                }
            });

            navLinks.forEach(function (link) {
                var href = link.getAttribute('href');
                if (href === '#' + currentSectionId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }

        window.addEventListener('scroll', updateActiveLink, { passive: true });
        updateActiveLink();
    })();

    /* ===================================================
       VIDEO MODAL
       Opens the video modal when the hero button is clicked,
       closes when the X button is clicked OR when the user
       clicks the dark overlay behind the modal box.
       Video is paused whenever the modal closes.
       =================================================== */
    (function initVideoModal() {
        var openBtn = qs('#openVideoBtn');
        var modal = qs('#videoModal');
        var modalBox = qs('#modalBox');
        var closeBtn = qs('#modalClose');
        var video = qs('#productVideo');

        if (!openBtn || !modal || !modalBox || !closeBtn || !video) return;

        var BODY_CLASS = 'modal-open';

        function openModal() {
            modal.classList.add('is-open');
            document.body.classList.add(BODY_CLASS);
            document.body.style.overflow = 'hidden';
            modal.setAttribute('aria-hidden', 'false');

            // Focus the close button for accessibility
            setTimeout(function () {
                closeBtn.focus();
            }, 350);
        }

        function closeModal() {
            modal.classList.remove('is-open');
            document.body.classList.remove(BODY_CLASS);
            document.body.style.overflow = '';
            modal.setAttribute('aria-hidden', 'true');

            // Pause and reset video playback
            video.pause();
            // Optionally reset to the beginning:
            // video.currentTime = 0;
        }

        // Open on hero button click
        openBtn.addEventListener('click', openModal);

        // Close on X button click
        closeBtn.addEventListener('click', closeModal);

        // Close when clicking the dim overlay (outside the modal box)
        modal.addEventListener('click', function (event) {
            if (!modalBox.contains(event.target)) {
                closeModal();
            }
        });

        // Close on Escape key press
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' || event.keyCode === 27) {
                var isOpen = modal.classList.contains('is-open');
                if (isOpen) {
                    closeModal();
                }
            }
        });

        // Set initial aria-hidden state
        modal.setAttribute('aria-hidden', 'true');
    })();

    /* ===================================================
       SCROLL REVEAL ANIMATIONS
       Uses IntersectionObserver to lazily add `.revealed`
       to elements with `.reveal`, triggering CSS transitions.
       =================================================== */
    (function initScrollReveal() {
        // Add .reveal to the elements we want animated
        var targets = qsa(
            '.about-card, .product-card, .channel-item, .stat-item, ' +
            '.about-lead, .about-body, .skills-list, ' +
            '.section-header, .contact-intro, .contact-form'
        );

        targets.forEach(function (el) {
            el.classList.add('reveal');
        });

        // Stagger product cards and about-cards
        qsa('.product-card').forEach(function (card, index) {
            card.style.transitionDelay = (index * 0.08) + 's';
        });

        qsa('.about-card').forEach(function (card, index) {
            card.style.transitionDelay = (index * 0.06) + 's';
        });

        qsa('.channel-item').forEach(function (item, index) {
            item.style.transitionDelay = (index * 0.07) + 's';
        });

        // Check if IntersectionObserver is supported
        if (!('IntersectionObserver' in window)) {
            // Fallback: reveal all immediately
            targets.forEach(function (el) {
                el.classList.add('revealed');
            });
            return;
        }

        var observerOptions = {
            root: null,
            rootMargin: '0px 0px -60px 0px',
            threshold: 0.12
        };

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        targets.forEach(function (el) {
            observer.observe(el);
        });
    })();

    /* ===================================================
       CONTACT FORM HANDLER
       Intercepts form submission, shows success message,
       and resets the form after a short delay.
       (Replace this logic with a real backend/API call
       such as Formspree, EmailJS, or your own endpoint.)
       =================================================== */
    (function initContactForm() {
        var form = qs('#contactForm');
        var successMsg = qs('#formSuccess');
        var submitBtn = form ? form.querySelector('.btn-submit') : null;

        if (!form || !successMsg || !submitBtn) return;

        var submitText = submitBtn.querySelector('.submit-text');
        var submitIcon = submitBtn.querySelector('.submit-icon');

        function setLoadingState(isLoading) {
            if (isLoading) {
                submitBtn.disabled = true;
                if (submitText) submitText.textContent = 'Mengirim...';
                if (submitIcon) submitIcon.textContent = '⏳';
                submitBtn.style.opacity = '0.7';
                submitBtn.style.cursor = 'not-allowed';
            } else {
                submitBtn.disabled = false;
                if (submitText) submitText.textContent = 'Kirim Pesan';
                if (submitIcon) submitIcon.textContent = '→';
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            }
        }

        function showSuccess() {
            successMsg.classList.add('visible');
        }

        function hideSuccess() {
            successMsg.classList.remove('visible');
        }

        function resetForm() {
            form.reset();
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            var name = (qs('#name', form).value || '').trim();
            var message = (qs('#message', form).value || '').trim();

            if (!name) {
                qs('#name', form).focus();
                qs('#name', form).style.borderColor = '#e05252';
                setTimeout(function () {
                    qs('#name', form).style.borderColor = '';
                }, 2000);
                return;
            }

            if (!message) {
                qs('#message', form).focus();
                qs('#message', form).style.borderColor = '#e05252';
                setTimeout(function () {
                    qs('#message', form).style.borderColor = '';
                }, 2000);
                return;
            }

            // ---- REPLACE THIS BLOCK WITH YOUR REAL SUBMISSION LOGIC ----
            // Example using Formspree:
            //   fetch('https://formspree.io/f/YOUR_FORM_ID', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ name: name, message: message })
            //   }).then(function(res) { ... });
            //
            // For now, we simulate a 1.2 second network delay:
            setLoadingState(true);
            hideSuccess();

            setTimeout(function () {
                setLoadingState(false);
                showSuccess();
                resetForm();

                // Hide success message after 5 seconds
                setTimeout(function () {
                    hideSuccess();
                }, 5000);
            }, 1200);
            // ---- END OF SIMULATED SUBMISSION ----
        });

        // Remove red border on input when user starts typing again
        var inputs = qsa('input, textarea, select', form);
        inputs.forEach(function (input) {
            input.addEventListener('input', function () {
                input.style.borderColor = '';
            });
        });
    })();

    /* ===================================================
       SMOOTH ANCHOR SCROLL WITH NAVBAR OFFSET
       Intercepts all internal anchor links and applies
       smooth scrolling with correct offset for the
       fixed navbar height.
       =================================================== */
    (function initSmoothScroll() {
        document.addEventListener('click', function (event) {
            var target = event.target.closest('a[href^="#"]');
            if (!target) return;

            var href = target.getAttribute('href');
            if (!href || href === '#') return;

            var destination = qs(href);
            if (!destination) return;

            event.preventDefault();

            var navbarHeight = parseInt(
                getComputedStyle(document.documentElement).getPropertyValue('--navbar-height'),
                10
            ) || 68;

            var destinationTop = destination.getBoundingClientRect().top + window.scrollY;
            var scrollToY = destinationTop - navbarHeight - 8; // 8px breathing room

            window.scrollTo({
                top: Math.max(0, scrollToY),
                behavior: 'smooth'
            });
        });
    })();

    /* ===================================================
       PRODUCT CARD TILT EFFECT (subtle 3D hover)
       Adds a gentle perspective tilt on product cards
       as the user moves their mouse across them.
       =================================================== */
    (function initCardTilt() {
        // Only run on non-touch devices
        if ('ontouchstart' in window) return;

        var cards = qsa('.product-card');

        cards.forEach(function (card) {
            var MAX_TILT = 4; // degrees

            card.addEventListener('mousemove', function (event) {
                var rect = card.getBoundingClientRect();
                var x = event.clientX - rect.left;
                var y = event.clientY - rect.top;
                var centerX = rect.width / 2;
                var centerY = rect.height / 2;
                var rotateY = ((x - centerX) / centerX) * MAX_TILT;
                var rotateX = -((y - centerY) / centerY) * MAX_TILT;

                card.style.transform =
                    'translateY(-8px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
                card.style.transition = 'transform 0.1s ease';
            });

            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
                card.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
            });
        });
    })();

    /* ===================================================
       HERO BADGE ENTRANCE STAGGER
       Makes the hero section elements feel alive by
       running a quick stagger check on page load.
       =================================================== */
    (function initHeroEntrance() {
        // The CSS handles animations via animation-delay,
        // but we make sure elements are not invisible if
        // CSS animations are disabled (prefers-reduced-motion).
        var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReduced) {
            var animated = qsa('.hero-badge, .hero-title, .hero-subtitle, .hero-actions, .hero-stats, .hero-scroll-hint');
            animated.forEach(function (el) {
                el.style.opacity = '1';
                el.style.transform = 'none';
                el.style.animation = 'none';
            });
        }
    })();

})();

document.getElementById('orderForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Ambil data dari form
    const data = {
        nama: document.getElementById('nama').value,
        username: document.getElementById('username_tele').value,
        produk: document.getElementById('produk').value,
        pesan: document.getElementById('pesan').value
    };

    // Ganti dengan URL hasil Deploy terbaru Anda
    const urlBackend = "https://script.google.com/macros/s/AKfycbzyAYtGER-bCL_fxMX9dzbPHkz34Ur08ZVGP_6OW8gKgRT9eb4pWgUStrtyX-evD_9mMw/exec";

    fetch(urlBackend, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(() => {
            Swal.fire({
                title: 'Berhasil Terkirim!',
                text: 'Pesanan Anda sudah kami terima. Mohon tunggu admin merespon.',
                icon: 'success', // Bisa diganti 'info', 'warning', 'question'
                confirmButtonText: 'Siap, terima kasih!',
                confirmButtonColor: '#c8873a', // Sesuaikan dengan warna tema web Anda
                background: '#ffffff',
                backdrop: true, // Efek gelap di belakang alert
                customClass: {
                    title: 'alert-title-style',
                    popup: 'alert-popup-style'
                }
            });
            document.getElementById('orderForm').reset();
        })
        .catch(err => {
            console.error("Gagal:", err);
            alert("Terjadi kesalahan, silakan coba lagi.");
        });
});
window.onload = function() {
        window.scrollTo(0, 0);
    };