        // 1. Lenis Smooth Scroll
        const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smooth: true });
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);

        // 2. GSAP Senkronizasyonu
        gsap.registerPlugin(ScrollTrigger);
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time)=>{ lenis.raf(time * 1000) });
        gsap.ticker.lagSmoothing(0, 0);

        // 3. Menü Animasyonu ve Yönetimi
        const menuToggleBtn = document.getElementById('menu-toggle');
        const menuText = document.getElementById('menu-text');
        const menuElement = document.getElementById('full-menu');
        const menuTl = gsap.timeline({ paused: true, reversed: true });

        menuTl.to(menuElement, { opacity: 1, duration: 0.4, ease: "power2.inOut" })
              .from(".menu-list-item", { y: 40, opacity: 0, stagger: 0.08, duration: 0.5, ease: "power3.out" }, "-=0.2")
              .from(".menu-info-item", { y: 20, opacity: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" }, "-=0.3");

        menuToggleBtn.addEventListener('click', () => {
            if (menuTl.reversed()) {
                menuElement.style.display = 'flex';
                menuElement.style.pointerEvents = 'auto';
                menuToggleBtn.classList.add("menu-open");
                menuText.innerText = "Kapat";
                lenis.stop();
                menuTl.play();
            } else {
                menuToggleBtn.classList.remove("menu-open");
                menuText.innerText = "Menü";
                lenis.start();
                menuTl.reverse().then(() => { menuElement.style.display = 'none'; });
            }
        });

        document.querySelectorAll('.menu-link-item').forEach(link => {
            link.addEventListener('click', () => {
                menuToggleBtn.classList.remove("menu-open");
                menuText.innerText = "Menü";
                lenis.start();
                menuTl.reverse().then(() => { menuElement.style.display = 'none'; });
            });
        });

        // 4. Hero Animasyonları ve 3D Interaktivite
        window.addEventListener("load", () => {
            const tl = gsap.timeline();
            tl.to(".hero-title-word", { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: "power3.out" })
              .to(".hero-fade", { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }, "-=0.4");
        });

        // 3D Parallax Mouse Hareket Parallaks Efekti (bunu-kullan.png için)
        const centerpieceWrapper = document.querySelector('.centerpiece-wrapper');
        const centerpieceInner = document.querySelector('.centerpiece-inner');

        if (centerpieceWrapper && centerpieceInner) {
            document.addEventListener('mousemove', (e) => {
                const xAxis = (window.innerWidth / 2 - e.pageX) / 30;
                const yAxis = (window.innerHeight / 2 - e.pageY) / 30;
                gsap.to(centerpieceInner, {
                    rotationY: xAxis,
                    rotationX: -yAxis,
                    duration: 0.8,
                    ease: "power2.out"
                });
            });

            document.addEventListener('mouseleave', () => {
                gsap.to(centerpieceInner, {
                    rotationY: 0,
                    rotationX: 0,
                    duration: 1.5,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        }

        // 5. Manyetik Buton
        const buttons = document.querySelectorAll('.magnetic-btn');
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', function(e) {
                const position = btn.getBoundingClientRect();
                const x = e.clientX - position.left - position.width / 2;
                const y = e.clientY - position.top - position.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });
            btn.addEventListener('mouseleave', function() { btn.style.transform = `translate(0px, 0px)`; });
        });

        // 6. Kart Stacking Scroll Efekti
        const cards = gsap.utils.toArray('.stack-card');
        cards.forEach((card, index) => {
            if (index < cards.length - 1) {
                gsap.to(card, {
                    scale: 0.95 - (cards.length - 1 - index) * 0.01,
                    scrollTrigger: {
                        trigger: card,
                        start: "top 120px",
                        endTrigger: ".stack-container",
                        end: "bottom bottom",
                        scrub: true,
                        pinSpacing: false
                    }
                });
            }
        });

        // 7. Teşhis Bölümü Scroll Animasyonu
        gsap.utils.toArray('.diagnostic-item').forEach((item) => {
            gsap.fromTo(item,
                { opacity: 0.1, y: 50 },
                { opacity: 1, y: 0, scrollTrigger: { trigger: item, start: "top 80%", end: "top 50%", scrub: true }}
            );
        });

        // 8. NELER YAPIYORUZ - SWIPER VE PREMİUM MOUSE-TRACK ENTEGRASYONU
        const swiper = new Swiper('.service-list-carousel', {
            slidesPerView: 'auto',
            spaceBetween: 24,
            freeMode: {
                enabled: true,
                momentumRatio: 0.5,
                momentumBounce: false,
            },
            grabCursor: true,
            mousewheel: {
                forceToAxis: true,
                sensitivity: 1,
            },
            breakpoints: {
                320: { spaceBetween: 16 },
                768: { spaceBetween: 24 }
            }
        });

        // Mouse Gezdirildiğinde Bandı Sağa-Sola Otomatik Akıtan Premium Mekanizma
        const solutionsSection = document.getElementById('solutions');
        if (solutionsSection) {
            const swiperWrapper = solutionsSection.querySelector('.swiper-wrapper');

            solutionsSection.addEventListener('mousemove', (e) => {
                if (window.innerWidth < 1024) return; // Mobil ve tabletlerde dokunmatik modda kalsın

                const rect = solutionsSection.getBoundingClientRect();
                const mouseX = e.clientX - rect.left; // Mouse'un section içindeki konumu (0 - genişlik)
                const pct = mouseX / rect.width; // Yüzdelik dilim (0 ile 1 arası)

                const scrollWidth = swiperWrapper.scrollWidth;
                const visibleWidth = rect.width;
                const maxScroll = scrollWidth - visibleWidth + 80; // Ekleme payı

                if (maxScroll > 0) {
                    // GSAP ile sarsıntısız, pürüzsüz akma hareketi
                    gsap.to(swiperWrapper, {
                        x: -maxScroll * pct,
                        duration: 1.2,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                }
            });

            solutionsSection.addEventListener('mouseleave', () => {
                // Mouse alandan çıktığında hafifçe fren yapıp dursun
                gsap.killTweensOf(swiperWrapper);
            });
        }

        // Referanslar Swiper
        const testiSwiper = new Swiper('.testi-swiper', {
            slidesPerView: 'auto',
            spaceBetween: 30,
            loop: true,
            autoplay: { delay: 7000, disableOnInteraction: false },
            navigation: { prevEl: '.testi-btn-prev', nextEl: '.testi-btn-next' },
            centeredSlides: true,
        });

        window.addEventListener("load", () => { window.setTimeout(() => { ScrollTrigger.refresh(); }, 500); });

        // Marquee: mouse hareketi hafifçe hızlandırır
        const heroMarquee = document.querySelector('.hero-giant-marquee');
        let currentSpeed = 100;
        let targetSpeed = 100;
        let mouseStopTimer;

        document.addEventListener('mousemove', () => {
            targetSpeed = 55;
            clearTimeout(mouseStopTimer);
            mouseStopTimer = setTimeout(() => { targetSpeed = 100; }, 500);
        });

        (function tickMarquee() {
            currentSpeed += (targetSpeed - currentSpeed) * 0.04;
            if (heroMarquee) heroMarquee.style.setProperty('--marquee-speed', currentSpeed.toFixed(1) + 's');
            requestAnimationFrame(tickMarquee);
        })();
