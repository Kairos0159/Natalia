document.addEventListener('DOMContentLoaded', function() {
    // ===== ELEMENTOS DEL DOM =====
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const currentYear = document.getElementById('current-year');
    const scrollTopBtn = document.getElementById('scroll-top');
    const contactForm = document.getElementById('contactForm');
    
    // ===== CARRUSEL ELEMENTOS =====
    const carruselTrack = document.querySelector('.carrusel-track-large');
    const carruselSlides = document.querySelectorAll('.carrusel-slide-large');
    const prevBtn = document.querySelector('.carrusel-btn.prev');
    const nextBtn = document.querySelector('.carrusel-btn.next');
    const indicators = document.querySelectorAll('.indicator-large');
    const slideCounter = document.querySelector('.slide-counter');
    
    // ===== VARIABLES GLOBALES =====
    let currentSlide = 0;
    const totalSlides = carruselSlides.length;
    let carruselInterval;
    let isTransitioning = false;
    
    // ===== FUNCIONES DE INICIALIZACIÓN =====
    function init() {
        setCurrentYear();
        setupNavigation();
        setupCarrusel();
        setupScrollTop();
        setupFormValidation();
        setupAnimations();
        setupPDFViewers();
        setupVideoPlayers();
    }
    
    // ===== AÑO ACTUAL =====
    function setCurrentYear() {
        currentYear.textContent = new Date().getFullYear();
    }
    
    // ===== NAVEGACIÓN =====
    function setupNavigation() {
        // Toggle del menú móvil
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Navegación entre secciones
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Cerrar menú móvil si está abierto
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
                
                // Obtener la sección objetivo
                const targetId = this.getAttribute('href').substring(1);
                
                // Actualizar enlace activo
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                this.classList.add('active');
                
                // Mostrar sección activa con animación
                showSection(targetId);
                
                // Desplazamiento suave
                setTimeout(() => {
                    document.getElementById(targetId).scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 300);
            });
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
    
    // ===== MOSTRAR SECCIÓN CON ANIMACIÓN =====
    function showSection(sectionId) {
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.style.display = 'block';
                setTimeout(() => {
                    section.classList.add('active-section');
                    // Animar elementos dentro de la sección
                    animateSectionElements(section);
                }, 50);
            } else {
                section.classList.remove('active-section');
                setTimeout(() => {
                    section.style.display = 'none';
                }, 500);
            }
        });
    }
    
    // ===== ANIMAR ELEMENTOS DE SECCIÓN =====
    function animateSectionElements(section) {
        const animatedElements = section.querySelectorAll('.pdf-card, .video-card, .link-card, .stat-card');
        animatedElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });
    }
    
    // ===== CARRUSEL MEJORADO =====
    function setupCarrusel() {
        // Configurar dimensiones iniciales
        updateCarruselDimensions();
        
        // Event listeners para botones
        prevBtn.addEventListener('click', () => navigateCarrusel(-1));
        nextBtn.addEventListener('click', () => navigateCarrusel(1));
        
        // Event listeners para indicadores
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => goToSlide(index));
        });
        
        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') navigateCarrusel(-1);
            if (e.key === 'ArrowRight') navigateCarrusel(1);
        });
        
        // Swipe para móviles
        let touchStartX = 0;
        let touchEndX = 0;
        
        carruselTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        carruselTrack.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const difference = touchStartX - touchEndX;
            
            if (Math.abs(difference) > swipeThreshold) {
                if (difference > 0) {
                    navigateCarrusel(1); // Swipe izquierda
                } else {
                    navigateCarrusel(-1); // Swipe derecha
                }
            }
        }
        
        // Autoavance
        startAutoAdvance();
        
        // Pausar autoavance al interactuar
        const carruselContainer = document.querySelector('.carrusel-container-large');
        carruselContainer.addEventListener('mouseenter', pauseAutoAdvance);
        carruselContainer.addEventListener('touchstart', pauseAutoAdvance);
        carruselContainer.addEventListener('mouseleave', startAutoAdvance);
        
        // Actualizar dimensiones en resize
        window.addEventListener('resize', updateCarruselDimensions);
        
        // Actualizar contador
        updateSlideCounter();
    }
    
    function navigateCarrusel(direction) {
        if (isTransitioning) return;
        
        isTransitioning = true;
        const newSlide = (currentSlide + direction + totalSlides) % totalSlides;
        goToSlide(newSlide);
        
        setTimeout(() => {
            isTransitioning = false;
        }, 600);
    }
    
    function goToSlide(slideIndex) {
        currentSlide = slideIndex;
        
        // Actualizar posición del track
        carruselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Actualizar indicadores
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
        
        // Actualizar contador
        updateSlideCounter();
        
        // Restart auto advance
        restartAutoAdvance();
    }
    
    function updateSlideCounter() {
        slideCounter.textContent = `${currentSlide + 1} / ${totalSlides}`;
    }
    
    function updateCarruselDimensions() {
        const container = document.querySelector('.carrusel-container-large');
        const slides = document.querySelectorAll('.carrusel-slide-large');
        
        slides.forEach(slide => {
            slide.style.minWidth = `${container.offsetWidth}px`;
        });
    }
    
    function startAutoAdvance() {
        carruselInterval = setInterval(() => {
            navigateCarrusel(1);
        }, 7000); // 7 segundos
    }
    
    function pauseAutoAdvance() {
        clearInterval(carruselInterval);
    }
    
    function restartAutoAdvance() {
        pauseAutoAdvance();
        startAutoAdvance();
    }
    
    // ===== SCROLL TOP =====
    function setupScrollTop() {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ===== TEMA OSCURO/CLARO =====
    themeToggle.addEventListener('click', function() {
        if (body.classList.contains('light-mode')) {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            this.innerHTML = '<i class="fas fa-sun"></i><span>Modo Día</span>';
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
            this.innerHTML = '<i class="fas fa-moon"></i><span>Modo Noche</span>';
        }
    });
    
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Modo Día</span>';
    }
    
    // ===== FORMULARIO DE CONTACTO =====
    function setupFormValidation() {
        if (!contactForm) return;
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                // Simular envío
                simulateFormSubmission();
            }
        });
        
        // Validación en tiempo real
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearError);
        });
    }
    
    function validateForm() {
        let isValid = true;
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    function validateField(e) {
        const field = e.target || e;
        let isValid = true;
        let errorMessage = '';
        
        // Limpiar error anterior
        clearError(field);
        
        // Validar campo requerido
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = 'Este campo es requerido';
        }
        
        // Validar email
        if (field.type === 'email' && field.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                errorMessage = 'Ingresa un email válido';
            }
        }
        
        // Mostrar error si existe
        if (!isValid) {
            showError(field, errorMessage);
        }
        
        return isValid;
    }
    
    function showError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = 'var(--primary-color)';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        
        field.parentNode.appendChild(errorDiv);
        field.style.borderColor = 'var(--primary-color)';
    }
    
    function clearError(e) {
        const field = e.target || e;
        const error = field.parentNode.querySelector('.error-message');
        
        if (error) {
            error.remove();
        }
        
        field.style.borderColor = '';
    }
    
    function simulateFormSubmission() {
        const submitBtn = contactForm.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        
        // Mostrar estado de carga
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        // Simular delay de red
        setTimeout(() => {
            // Mostrar mensaje de éxito
            showNotification('¡Mensaje enviado con éxito! Te responderemos pronto.', 'success');
            
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Limpiar formulario
            contactForm.reset();
        }, 2000);
    }
    
    // ===== NOTIFICACIONES =====
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Estilos de notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--accent-color)' : 'var(--primary-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Botón para cerrar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // ===== ANIMACIONES =====
    function setupAnimations() {
        // Intersection Observer para animaciones al scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);
        
        // Observar elementos para animar
        const animatableElements = document.querySelectorAll('.pdf-card, .video-card, .link-card, .stat-card, .gallery-item');
        animatableElements.forEach(el => observer.observe(el));
        
        // Añadir estilos CSS para animaciones
        const style = document.createElement('style');
        style.textContent = `
            .pdf-card, .video-card, .link-card, .stat-card, .gallery-item {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .pdf-card.animated, .video-card.animated, .link-card.animated, .stat-card.animated, .gallery-item.animated {
                opacity: 1;
                transform: translateY(0);
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // ===== VISORES PDF =====
    function setupPDFViewers() {
        const pdfIframes = document.querySelectorAll('.pdf-preview iframe');
        
        pdfIframes.forEach(iframe => {
            // Añadir mensaje de carga
            iframe.onload = function() {
                const parent = iframe.parentNode;
                parent.classList.remove('loading');
            };
            
            // Manejar errores
            iframe.onerror = function() {
                const parent = iframe.parentNode;
                parent.classList.remove('loading');
                parent.innerHTML = `
                    <div class="pdf-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h4>No se pudo cargar el PDF</h4>
                        <p>El archivo no está disponible o hubo un error al cargarlo.</p>
                        <a href="${iframe.src}" class="btn" target="_blank">
                            <i class="fas fa-external-link-alt"></i> Abrir en nueva pestaña
                        </a>
                    </div>
                `;
            };
        });
    }
    
    // ===== REPRODUCTORES DE VIDEO =====
    function setupVideoPlayers() {
        const videos = document.querySelectorAll('video');
        
        videos.forEach(video => {
            // Añadir controles personalizados si es necesario
            video.addEventListener('play', () => {
                video.parentNode.classList.add('playing');
            });
            
            video.addEventListener('pause', () => {
                video.parentNode.classList.remove('playing');
            });
            
            // Prevenir autoplay en móviles
            if (window.innerWidth <= 768) {
                video.removeAttribute('autoplay');
            }
        });
    }
    
    // ===== INICIALIZAR TODO =====
    init();
});