/**
 * SYNAPS FAQ - Interactive Controller (English Version)
 * Webedia & Elephant AI Training Portal
 */
document.addEventListener('DOMContentLoaded', () => {

  // Main DOM elements
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

  // FAQ elements
  const faqCards = Array.from(document.querySelectorAll('.faq-card'));
  const sectionBlocks = Array.from(document.querySelectorAll('.faq-section-block'));

  // PACTE Generator elements
  const pInput = document.getElementById('pInput');
  const aInput = document.getElementById('aInput');
  const cInput = document.getElementById('cInput');
  const tInput = document.getElementById('tInput');
  const eInput = document.getElementById('eInput');
  const promptOutputBox = document.getElementById('promptOutputBox');
  const fillSamplePromptBtn = document.getElementById('fillSamplePromptBtn');
  const clearPromptBtn = document.getElementById('clearPromptBtn');
  const copyPromptResultBtn = document.getElementById('copyPromptResultBtn');

  // Application State
  let currentCategory = 'all';
  let currentSearchQuery = '';
  let toastTimer = null;

  /* ============================================================
     1. THEME MANAGEMENT (DARK / LIGHT MODE)
     ============================================================ */
  const savedTheme = localStorage.getItem('synaps_theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('synaps_theme', newTheme);
      showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} theme enabled`);
    });
  }

  /* ============================================================
     2. TOAST NOTIFICATIONS MANAGEMENT
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
     3. COMBINED FILTERING AND SEARCH
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

      // Check category
      const matchesCategory = currentCategory === 'all' || category === currentCategory;

      // Check search query
      const matchesSearch = query === '' || combinedText.includes(query);

      if (matchesCategory && matchesSearch) {
        card.style.display = '';
        visibleCount++;

        // If search is active, automatically expand matched questions
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

    // Hide or show section blocks depending on whether they contain visible cards
    sectionBlocks.forEach(block => {
      const visibleCardsInSection = block.querySelectorAll('.faq-card:not([style*="display: none"])');
      if (visibleCardsInSection.length === 0) {
        block.style.display = 'none';
      } else {
        block.style.display = '';
      }
    });

    // Update result count and empty state UI
    if (visibleCount === 0) {
      if (noResultsBlock) noResultsBlock.style.display = 'block';
      if (searchResultCount) searchResultCount.textContent = 'No matching questions found';
    } else {
      if (noResultsBlock) noResultsBlock.style.display = 'none';
      if (searchResultCount) {
        if (query === '' && currentCategory === 'all') {
          searchResultCount.textContent = `Showing all ${visibleCount} questions`;
        } else {
          searchResultCount.textContent = `Showing ${visibleCount} of ${faqCards.length} questions`;
        }
      }
    }
  }

  // Simple title text highlighting
  function highlightMatch(card, query) {
    const titleEl = card.querySelector('.q-title');
    if (!titleEl) return;
    
    // Save original text if not already stored
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

  // Search input event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = currentSearchQuery.length > 0 ? 'flex' : 'none';
      }
      applyFiltersAndSearch();
    });

    // Escape key support
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
     4. CATEGORY FILTER PILLS
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
     5. EXPAND / COLLAPSE ALL
     ============================================================ */
  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', () => {
      faqCards.forEach(card => {
        if (card.style.display !== 'none') {
          const details = card.querySelector('details');
          if (details) details.open = true;
        }
      });
      showToast('All questions expanded');
    });
  }

  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', () => {
      faqCards.forEach(card => {
        const details = card.querySelector('details');
        if (details) details.open = false;
      });
      showToast('All questions collapsed');
    });
  }

  /* ============================================================
     6. COPY DIRECT LINK TO QUESTION
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
          showToast(`Link copied! (#${card.id})`);
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
      showToast('Link copied to clipboard!');
    } catch (err) {
      showToast('Unable to copy link automatically');
    }
    document.body.removeChild(tempInput);
  }

  /* ============================================================
     7. AUTO-OPEN ON URL HASH DETECTED (#faq-X-Y)
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
     8. BACK TO TOP BUTTON
     ============================================================ */
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     9. INTERACTIVE P.A.C.T.E. PROMPT GENERATOR
     ============================================================ */
  function updatePromptPreview() {
    const p = pInput?.value.trim() || '';
    const a = aInput?.value.trim() || '';
    const c = cInput?.value.trim() || '';
    const t = tInput?.value.trim() || '';
    const e = eInput?.value.trim() || '';

    if (!p && !a && !c && !t && !e) {
      promptOutputBox.innerHTML = '<span class="preview-placeholder">Fill out the fields or click "Load Demo Example" to see the generated prompt compile in real time, ready to copy into Synaps Chat.</span>';
      return;
    }

    let assembled = '';
    if (p) assembled += `**[Persona]** ${p}\n\n`;
    if (a) assembled += `**[Action]** ${a}\n\n`;
    if (c) assembled += `**[Context]** ${c}\n\n`;
    if (t) assembled += `**[Tone]** ${t}\n\n`;
    if (e) assembled += `**[Element / Format]** ${e}`;

    promptOutputBox.textContent = assembled.trim();
  }

  [pInput, aInput, cInput, tInput, eInput].forEach(input => {
    if (input) {
      input.addEventListener('input', updatePromptPreview);
    }
  });

  if (fillSamplePromptBtn) {
    fillSamplePromptBtn.addEventListener('click', () => {
      pInput.value = 'Act as a Senior Strategic Advisor and Specialized Copywriter for Webedia Digital Media.';
      aInput.value = 'Analyze the latest product launches from our direct competitors and draw up an editorial roadmap featuring 5 distinctive thematic proposals.';
      cInput.value = 'We are preparing the content roadmap for next quarter across EMEA and LATAM, focusing heavily on maximizing Google Discover visibility and organic engagement.';
      tInput.value = 'Professional, persuasive, direct, analytical, and highly business-KPI oriented.';
      eInput.value = 'Deliver the output structured as a table with columns: [Topic], [Hook / Title Draft], [Key Target Audience], [Estimated KPI Impact], and [Differentiating Angle].';
      
      updatePromptPreview();
      showToast('P.A.C.T.E. example loaded');
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
      showToast('Fields cleared');
    });
  }

  if (copyPromptResultBtn) {
    copyPromptResultBtn.addEventListener('click', () => {
      const content = promptOutputBox.textContent.trim();
      if (!content || content.includes('Fill out the fields')) {
        showToast('First enter data into at least one field');
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content).then(() => {
          showToast('Prompt copied to clipboard!');
        }).catch(() => fallbackCopyText(content));
      } else {
        fallbackCopyText(content);
      }
    });
  }

  /* ============================================================
     10. FULLSCREEN SLIDE VIEW (LIGHTBOX)
     ============================================================ */
  const lightbox = document.getElementById('imageLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxOverlay = document.querySelector('.lightbox-overlay');

  function openLightbox(imgEl, captionText) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = imgEl.src;
    lightboxImg.alt = imgEl.alt || 'Slide Preview';
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
