document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("siteHeader");
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  const sections = document.querySelectorAll("section[id]");
  const revealItems = document.querySelectorAll(
    ".feature-card, .layer-card, .impact-card, .pricing-card, .cta-card, .demo-gallery"
  );
  const counters = document.querySelectorAll("[data-count]");

  /* Sticky navbar background on scroll */
  const updateHeader = () => {
    if (!header) return;

    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader);


  /* Smooth close mobile nav after click */
  navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    // Do not close the mobile navbar when clicking dropdown toggles
    if (link.classList.contains("dropdown-toggle")) {
      return;
    }

    const navbarCollapse = document.querySelector(".navbar-collapse");

    if (navbarCollapse && navbarCollapse.classList.contains("show")) {
      const bootstrapCollapse =
        bootstrap.Collapse.getInstance(navbarCollapse) ||
        new bootstrap.Collapse(navbarCollapse);

      bootstrapCollapse.hide();
    }
  });
});

  /* Active nav link on scroll */
/* Active nav link on scroll — homepage section links only */
const sectionLinks = document.querySelectorAll(
  '.navbar-nav .nav-link[href^="#"]:not(.dropdown-toggle)'
);

const pageSections = document.querySelectorAll("main section[id]");

const setActiveSectionNav = () => {
  if (!sectionLinks.length || !pageSections.length) return;

  let currentSectionId = "";

  pageSections.forEach((section) => {
    const sectionTop = section.offsetTop - 140;

    if (window.scrollY >= sectionTop) {
      currentSectionId = section.getAttribute("id");
    }
  });

  sectionLinks.forEach((link) => {
    link.classList.remove("active");

    if (link.getAttribute("href") === `#${currentSectionId}`) {
      link.classList.add("active");
    }
  });
};

window.addEventListener("scroll", setActiveSectionNav);
setActiveSectionNav();
/* Active nav link by current page URL */
const currentPath = window.location.pathname;

document.querySelectorAll(".navbar-nav a[href]").forEach((link) => {
  const href = link.getAttribute("href");

  if (!href || href === "#" || href.startsWith("#")) return;

  const linkPath = new URL(link.href, window.location.origin).pathname;

  if (linkPath === currentPath) {
    link.classList.add("active");

    const parentDropdown = link.closest(".dropdown");
    const dropdownToggle = parentDropdown?.querySelector(".dropdown-toggle");

    if (dropdownToggle) {
      dropdownToggle.classList.add("active");
    }
  }
});
  /* Reveal animation */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14
    }
  );

  revealItems.forEach((item) => {
    item.classList.add("reveal");
    revealObserver.observe(item);
  });


  /* Animated counters */
  const animateCounter = (counter) => {
    const target = Number(counter.dataset.count);
    const duration = 1200;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(progress * target);

      counter.textContent = value;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.textContent = target;
      }
    };

    requestAnimationFrame(update);
  };

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.5
    }
  );

  counters.forEach((counter) => counterObserver.observe(counter));


  /* Product image tilt effect */
  const demoCards = document.querySelectorAll(".browser-card, .layer-card");

  demoCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const rotateX = ((y / rect.height) - 0.5) * -4;
      const rotateY = ((x / rect.width) - 0.5) * 4;

      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
});

// /* Copy contact email */
const copyEmailButtons = document.querySelectorAll(".contact-copy-btn");

copyEmailButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const email = button.dataset.email;

    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);

      const originalText = button.textContent;
      button.textContent = "Copied";
      button.classList.add("copied");

      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove("copied");
      }, 1600);
    } catch (error) {
      button.textContent = "Copy failed";
    }
  });
});

/* =========================================================================
   Book a Meet / Energy Trading Week Modal AJAX Handler
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const bookMeetingForm = document.getElementById("bookMeetingForm");
  const meetingFormStatus = document.getElementById("meetingFormStatus");
  const btnSubmitMeeting = document.getElementById("btnSubmitMeeting");
  const meetingFormContainer = document.getElementById("meetingFormContainer");
  const meetingSuccessContainer = document.getElementById("meetingSuccessContainer");
  const modalHeaderContent = document.getElementById("modalHeaderContent");

  if (bookMeetingForm) {
    bookMeetingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Form validation
      if (!bookMeetingForm.checkValidity()) {
        e.stopPropagation();
        bookMeetingForm.classList.add("was-validated");
        return;
      }

      // Collect data
      const formData = new FormData(bookMeetingForm);
      const payload = Object.fromEntries(formData.entries());

      // Loading state
      btnSubmitMeeting.disabled = true;
      const btnText = btnSubmitMeeting.querySelector(".btn-text");
      const btnSpinner = btnSubmitMeeting.querySelector(".spinner-border");
      if (btnText) btnText.textContent = "Transmitting to sales@bluwis.com...";
      if (btnSpinner) btnSpinner.classList.remove("d-none");
      if (meetingFormStatus) {
        meetingFormStatus.classList.add("d-none");
        meetingFormStatus.className = "alert d-none mt-3 mb-0";
      }

      try {
        const response = await fetch("/api/book-meeting", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Display success state inside modal
          if (modalHeaderContent) {
            modalHeaderContent.classList.add("d-none");
          }

          if (meetingFormContainer && meetingSuccessContainer) {
            const leadNameSpan = document.getElementById("successLeadName");
            const leadEmailSpan = document.getElementById("successLeadEmail");
            if (leadNameSpan) leadNameSpan.textContent = payload.name;
            if (leadEmailSpan) leadEmailSpan.textContent = payload.email;

            meetingFormContainer.classList.add("d-none");
            meetingSuccessContainer.classList.remove("d-none");
          }
          bookMeetingForm.reset();
          bookMeetingForm.classList.remove("was-validated");
        } else {
          // Show error alert
          if (meetingFormStatus) {
            meetingFormStatus.textContent = result.message || "Failed to submit request. Please try again.";
            meetingFormStatus.className = "alert alert-danger mt-3 mb-0";
            meetingFormStatus.classList.remove("d-none");
          }
        }
      } catch (err) {
        console.error("Booking submission error:", err);
        if (meetingFormStatus) {
          meetingFormStatus.textContent = "Network error. Please try again or reach out to sales@bluwis.com directly.";
          meetingFormStatus.className = "alert alert-danger mt-3 mb-0";
          meetingFormStatus.classList.remove("d-none");
        }
      } finally {
        btnSubmitMeeting.disabled = false;
        if (btnText) btnText.textContent = "Confirm & Book Meeting";
        if (btnSpinner) btnSpinner.classList.add("d-none");
      }
    });

    // Reset modal view when dismissed
    const bookMeetingModalEl = document.getElementById("bookMeetingModal");
    if (bookMeetingModalEl) {
      bookMeetingModalEl.addEventListener("hidden.bs.modal", () => {
        if (modalHeaderContent) {
          modalHeaderContent.classList.remove("d-none");
        }
        if (meetingFormContainer && meetingSuccessContainer) {
          meetingFormContainer.classList.remove("d-none");
          meetingSuccessContainer.classList.add("d-none");
        }
        if (meetingFormStatus) {
          meetingFormStatus.classList.add("d-none");
        }
        bookMeetingForm.reset();
        bookMeetingForm.classList.remove("was-validated");
      });
    }
  }
});