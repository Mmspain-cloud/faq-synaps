/**
 * SYNAPS FAQ - Interactive Controller
 * Webedia & Elephant AI Training Portal
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elementos DOM principales
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const searchInput = document.getElementById('faqSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const searchResultCount = document.getElementById('searchResultCount');
  const filterPills = document.querySelectorAll('.filter-pill');
  const expandAllBtn = document.getElementById('expandAllBtn');
  const collapseAllBtn = document.getElementById('collapseAllBtn');
  const backToTopBtn = document.getElementById('backToTopBtn');
  const noResultsBlock = document.getElementById('noResultsBlock');
  const resetSearchBtn = document.getElementById('resetSearchBtn');
  const toast = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  // Elementos del FAQ
  const faqCards = Array.from(document.querySelectorAll('.faq-card'));
  const sectionBlocks = Array.from(document.querySelectorAll('.faq-section-block'));

  // Elementos del Generador PACTE
  const pInput = document.getElementById('pInput');
  const aInput = document.getElementById('aInput');
  const cInput = document.getElementById('cInput');
  const tInput = document.getElementById('tInput');
  const eInput = document.getElementById('eInput');
  const promptOutputBox = document.getElementById('promptOutputBox');
  const fillSamplePromptBtn = document.getElementById('fillSamplePromptBtn');
  const clearPromptBtn = document.getElementById('clearPromptBtn');
  const copyPromptResultBtn = document.getElementById('copyPromptResultBtn');

  // Estado de la aplicación
  let currentCategory = 'all';
  let currentSearchQuery = '';
  let toastTimer = null;

  /* ============================================================
     1. GESTIÓN DE TEMA (MODO OSCURO / CLARO)
     ============================================================ */
  const savedTheme = localStorage.getItem('synaps_theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('synaps_theme', newTheme);
      showToast(`Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`);
    });
  }

  /* ============================================================
     2. GESTIÓN DE NOTIFICACIONES TOAST
     ============================================================ */
  function showToast(message) {
    if (!toast) return;
    toastMessage.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  /* ============================================================
     3. FILTRADO Y BÚSQUEDA COMBINADA
     ============================================================ */
  function applyFiltersAndSearch() {
    const query = currentSearchQuery.trim().toLowerCase();
    let visibleCount = 0;

    faqCards.forEach(card => {
      const details = card.querySelector('details');
      const category = card.getAttribute('data-category');
      const questionTitle = card.querySelector('.q-title')?.textContent || '';
      const contentText = card.querySelector('.faq-content')?.textContent || '';
      const combinedText = `${questionTitle} ${contentText}`.toLowerCase();

      // Comprobación de categoría
      const matchesCategory = currentCategory === 'all' || category === currentCategory;

      // Comprobación de búsqueda
      const matchesSearch = query === '' || combinedText.includes(query);

      if (matchesCategory && matchesSearch) {
        card.style.display = '';
        visibleCount++;

        // Si hay una búsqueda activa, abrimos automáticamente las coincidencias
        if (query.length >= 2 && details) {
          details.open = true;
          highlightMatch(card, query);
        } else if (query.length === 0) {
          removeHighlight(card);
        }
      } else {
        card.style.display = 'none';
        removeHighlight(card);
      }
    });

    // Ocultar o mostrar bloques de sección si no tienen tarjetas visibles
    sectionBlocks.forEach(block => {
      const visibleCardsInSection = block.querySelectorAll('.faq-card:not([style*="display: none"])');
      if (visibleCardsInSection.length === 0) {
        block.style.display = 'none';
      } else {
        block.style.display = '';
      }
    });

    // Actualizar contador y estado vacío
    if (visibleCount === 0) {
      if (noResultsBlock) noResultsBlock.style.display = 'block';
      if (searchResultCount) searchResultCount.textContent = 'No se encontraron preguntas coincidentes';
    } else {
      if (noResultsBlock) noResultsBlock.style.display = 'none';
      if (searchResultCount) {
        if (query === '' && currentCategory === 'all') {
          searchResultCount.textContent = `Mostrando todas las ${visibleCount} preguntas`;
        } else {
          searchResultCount.textContent = `Mostrando ${visibleCount} de ${faqCards.length} preguntas`;
        }
      }
    }
  }

  // Resaltado de texto simple para el título
  function highlightMatch(card, query) {
    const titleEl = card.querySelector('.q-title');
    if (!titleEl) return;
    
    // Guardar original si no está guardado
    if (!titleEl.dataset.originalText) {
      titleEl.dataset.originalText = titleEl.textContent;
    }
    
    const text = titleEl.dataset.originalText;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    titleEl.innerHTML = text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  function removeHighlight(card) {
    const titleEl = card.querySelector('.q-title');
    if (!titleEl || !titleEl.dataset.originalText) return;
    titleEl.textContent = titleEl.dataset.originalText;
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Evento del buscador
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = currentSearchQuery.length > 0 ? 'flex' : 'none';
      }
      applyFiltersAndSearch();
    });

    // Soporte para tecla Escape
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        currentSearchQuery = '';
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
        applyFiltersAndSearch();
      }
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentSearchQuery = '';
      clearSearchBtn.style.display = 'none';
      searchInput.focus();
      applyFiltersAndSearch();
    });
  }

  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentSearchQuery = '';
      currentCategory = 'all';
      if (clearSearchBtn) clearSearchBtn.style.display = 'none';
      
      filterPills.forEach(pill => {
        pill.classList.toggle('active', pill.dataset.category === 'all');
      });

      applyFiltersAndSearch();
    });
  }

  /* ============================================================
     4. BOTONES DE FILTRO POR CATEGORÍA
     ============================================================ */
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.category || 'all';
      applyFiltersAndSearch();
    });
  });

  /* ============================================================
     5. EXPANDIR / COLAPSAR TODAS
     ============================================================ */
  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', () => {
      faqCards.forEach(card => {
        if (card.style.display !== 'none') {
          const details = card.querySelector('details');
          if (details) details.open = true;
        }
      });
      showToast('Todas las preguntas abiertas');
    });
  }

  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', () => {
      faqCards.forEach(card => {
        const details = card.querySelector('details');
        if (details) details.open = false;
      });
      showToast('Todas las preguntas colapsadas');
    });
  }

  /* ============================================================
     6. COPIAR ENLACE DIRECTO A LA PREGUNTA
     ============================================================ */
  const copyButtons = document.querySelectorAll('.copy-link-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      const card = btn.closest('.faq-card');
      if (!card || !card.id) return;

      const url = `${window.location.origin}${window.location.pathname}#${card.id}`;
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          showToast(`¡Enlace copiado! (#${card.id})`);
        }).catch(() => {
          fallbackCopyText(url);
        });
      } else {
        fallbackCopyText(url);
      }
    });
  });

  function fallbackCopyText(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      showToast('¡Enlace copiado al portapapeles!');
    } catch (err) {
      showToast('No se pudo copiar automáticamente');
    }
    document.body.removeChild(tempInput);
  }

  /* ============================================================
     7. ABRIR AUTOMÁTICAMENTE SI HAY HASH EN LA URL (#faq-X-Y)
     ============================================================ */
  function checkUrlHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#faq-')) {
      const targetCard = document.querySelector(hash);
      if (targetCard) {
        const details = targetCard.querySelector('details');
        if (details) details.open = true;

        setTimeout(() => {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetCard.classList.add('is-active');
          setTimeout(() => targetCard.classList.remove('is-active'), 2500);
        }, 150);
      }
    }
  }

  checkUrlHash();
  window.addEventListener('hashchange', checkUrlHash);

  /* ============================================================
     8. BOTÓN DE VOLVER ARRIBA
     ============================================================ */
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     9. GENERADOR INTERACTIVO DE PROMPTS P.A.C.T.E.
     ============================================================ */
  function updatePromptPreview() {
    const p = pInput?.value.trim() || '';
    const a = aInput?.value.trim() || '';
    const c = cInput?.value.trim() || '';
    const t = tInput?.value.trim() || '';
    const e = eInput?.value.trim() || '';

    if (!p && !a && !c && !t && !e) {
      promptOutputBox.innerHTML = '<span class="preview-placeholder">Completa los campos o pulsa en "Cargar Ejemplo Práctico" para ver el prompt generado en tiempo real listo para copiar en Synaps Chat.</span>';
      return;
    }

    let assembled = '';
    if (p) assembled += `**[Persona]** ${p}\n\n`;
    if (a) assembled += `**[Acción]** ${a}\n\n`;
    if (c) assembled += `**[Contexto]** ${c}\n\n`;
    if (t) assembled += `**[Tono]** ${t}\n\n`;
    if (e) assembled += `**[Elemento / Formato]** ${e}`;

    promptOutputBox.textContent = assembled.trim();
  }

  [pInput, aInput, cInput, tInput, eInput].forEach(input => {
    if (input) {
      input.addEventListener('input', updatePromptPreview);
    }
  });

  if (fillSamplePromptBtn) {
    fillSamplePromptBtn.addEventListener('click', () => {
      pInput.value = 'Actúa como un Consultor Estratégico Senior y Redactor Especializado en Medios Digitales de Webedia.';
      aInput.value = 'Analiza los últimos lanzamientos de nuestra competencia directa y elabora un plan editorial con 5 propuestas temáticas diferenciadoras.';
      cInput.value = 'Estamos preparando el plan de contenidos del próximo trimestre para España y Latam, enfocado en maximizar visibilidad en Google Discover y engagement orgánico.';
      tInput.value = 'Tono profesional, persuasivo, directo, riguroso y orientado a KPIs de negocio.';
      eInput.value = 'Entrega el resultado en una tabla con las columnas: [Tema], [Gancho / Título], [Audiencia Clave], [KPI Estimado] y [Ángulo Diferenciador].';
      
      updatePromptPreview();
      showToast('Ejemplo P.A.C.T.E. cargado');
    });
  }

  if (clearPromptBtn) {
    clearPromptBtn.addEventListener('click', () => {
      pInput.value = '';
      aInput.value = '';
      cInput.value = '';
      tInput.value = '';
      eInput.value = '';
      updatePromptPreview();
      showToast('Campos limpiados');
    });
  }

  if (copyPromptResultBtn) {
    copyPromptResultBtn.addEventListener('click', () => {
      const content = promptOutputBox.textContent.trim();
      if (!content || content.includes('Completa los campos')) {
        showToast('Primero completa algún campo del prompt');
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content).then(() => {
          showToast('¡Prompt copiado al portapapeles!');
        }).catch(() => fallbackCopyText(content));
      } else {
        fallbackCopyText(content);
      }
    });
  }

  /* ============================================================
     10. VISOR DE DIAPOSITIVAS EN PANTALLA COMPLETA (LIGHTBOX)
     ============================================================ */
  const lightbox = document.getElementById('imageLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxOverlay = document.querySelector('.lightbox-overlay');

  function openLightbox(imgEl, captionText) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = imgEl.src;
    lightboxImg.alt = imgEl.alt || 'Diapositiva';
    if (lightboxCaption) {
      lightboxCaption.textContent = captionText || imgEl.alt || '';
    }
    lightbox.style.display = 'flex';
    setTimeout(() => {
      lightbox.classList.add('active');
    }, 10);
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    setTimeout(() => {
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    }, 250);
  }

  const slideWrappers = document.querySelectorAll('.slide-image-wrapper');
  slideWrappers.forEach(wrapper => {
    wrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      const img = wrapper.querySelector('img');
      const figure = wrapper.closest('figure');
      const caption = figure?.querySelector('figcaption')?.textContent?.trim() || '';
      if (img) {
        openLightbox(img, caption);
      }
    });
  });

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }

  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', closeLightbox);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
});
