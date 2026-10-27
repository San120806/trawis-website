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
  const meetEmail = document.getElementById("meetEmail");
  const meetPhone = document.getElementById("meetPhone");
  const meetCountryCode = document.getElementById("meetCountryCode");
  const emailFeedback = document.getElementById("emailFeedback");
  const phoneFeedback = document.getElementById("phoneFeedback");

  const emailStrictRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  function validateEmailField() {
    if (!meetEmail) return true;
    const val = meetEmail.value.trim();
    if (!val) {
      meetEmail.setCustomValidity("Please provide your work email address.");
      if (emailFeedback) emailFeedback.textContent = "Please provide your work email address.";
      return false;
    }
    if (!emailStrictRegex.test(val)) {
      meetEmail.setCustomValidity("Please enter a valid work email address (e.g. name@company.com).");
      if (emailFeedback) emailFeedback.textContent = "Please enter a valid work email address (e.g. name@company.com).";
      return false;
    }
    meetEmail.setCustomValidity("");
    return true;
  }

  function validatePhoneField() {
    if (!meetPhone) return true;
    const raw = meetPhone.value.trim();
    const digits = raw.replace(/\D/g, "");
    meetPhone.value = digits;
    if (!digits) {
      meetPhone.setCustomValidity("Please provide your phone number.");
      if (phoneFeedback) phoneFeedback.textContent = "Please provide your phone number.";
      return false;
    }
    if (digits.length !== 10) {
      meetPhone.setCustomValidity("Phone number must be strictly 10 digits.");
      if (phoneFeedback) phoneFeedback.textContent = `Phone number must be strictly 10 digits (currently ${digits.length}/10).`;
      return false;
    }
    meetPhone.setCustomValidity("");
    return true;
  }

  if (meetEmail) {
    meetEmail.addEventListener("keydown", (e) => {
      if (e.key === " ") e.preventDefault();
    });
    meetEmail.addEventListener("input", () => {
      meetEmail.value = meetEmail.value.replace(/\s/g, "");
      validateEmailField();
    });
    meetEmail.addEventListener("blur", () => {
      validateEmailField();
    });
  }

  if (meetPhone) {
    meetPhone.addEventListener("input", () => {
      meetPhone.value = meetPhone.value.replace(/\D/g, "").slice(0, 10);
      validatePhoneField();
    });
    meetPhone.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData("text") || "";
      const trimmed = pasteData.trim();
      if (trimmed.startsWith("+") && meetCountryCode) {
        const match = trimmed.match(/^\+(\d{1,4})[\s.-]?(\d{10})$/);
        if (match) {
          const code = "+" + match[1];
          const opt = Array.from(meetCountryCode.options).find(o => o.value === code);
          if (opt) meetCountryCode.value = opt.value;
          meetPhone.value = match[2];
          validatePhoneField();
          return;
        }
      }
      const digits = pasteData.replace(/\D/g, "");
      meetPhone.value = digits.slice(-10);
      validatePhoneField();
    });
    meetPhone.addEventListener("blur", () => {
      validatePhoneField();
    });
  }

  if (bookMeetingForm) {
    bookMeetingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailValid = validateEmailField();
      const phoneValid = validatePhoneField();

      // Form validation
      if (!bookMeetingForm.checkValidity() || !emailValid || !phoneValid) {
        e.stopPropagation();
        bookMeetingForm.classList.add("was-validated");
        if (!emailValid && meetEmail) meetEmail.focus();
        else if (!phoneValid && meetPhone) meetPhone.focus();
        return;
      }

      // Collect data
      const formData = new FormData(bookMeetingForm);
      const payload = Object.fromEntries(formData.entries());

      // Format strictly combined phone number with country code
      const selectedCountryCode = payload.countryCode || (meetCountryCode ? meetCountryCode.value : "+1");
      const phoneDigits = (payload.phoneNumber || meetPhone.value || "").trim().replace(/\D/g, "");
      payload.phone = `${selectedCountryCode} ${phoneDigits}`;

      if (payload.preferredDate && payload.preferredTimeSlot) {
        payload.notes = `${payload.preferredDate} • ${payload.preferredTimeSlot}`;
      }

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

  /* =========================================================================
     Schedule a Demo Modal AJAX Handler (TraWis by BluWis)
     ========================================================================= */
  const scheduleDemoForm = document.getElementById("scheduleDemoForm");
  const demoFormStatus = document.getElementById("demoFormStatus");
  const btnSubmitDemo = document.getElementById("btnSubmitDemo");
  const demoFormContainer = document.getElementById("demoFormContainer");
  const demoSuccessContainer = document.getElementById("demoSuccessContainer");
  const demoModalHeaderContent = document.getElementById("demoModalHeaderContent");
  const demoEmail = document.getElementById("demoEmail");
  const demoPhone = document.getElementById("demoPhone");
  const demoCountryCode = document.getElementById("demoCountryCode");
  const demoEmailFeedback = document.getElementById("demoEmailFeedback");
  const demoPhoneFeedback = document.getElementById("demoPhoneFeedback");

  function validateDemoEmailField() {
    if (!demoEmail) return true;
    const val = demoEmail.value.trim();
    if (!val) {
      demoEmail.setCustomValidity("Please provide your work email address.");
      if (demoEmailFeedback) demoEmailFeedback.textContent = "Please provide your work email address.";
      return false;
    }
    if (!emailStrictRegex.test(val)) {
      demoEmail.setCustomValidity("Please enter a valid work email address (e.g. name@company.com).");
      if (demoEmailFeedback) demoEmailFeedback.textContent = "Please enter a valid work email address (e.g. name@company.com).";
      return false;
    }
    demoEmail.setCustomValidity("");
    return true;
  }

  function validateDemoPhoneField() {
    if (!demoPhone) return true;
    const raw = demoPhone.value.trim();
    const digits = raw.replace(/\D/g, "");
    demoPhone.value = digits;
    if (!digits) {
      demoPhone.setCustomValidity("Please provide your phone number.");
      if (demoPhoneFeedback) demoPhoneFeedback.textContent = "Please provide your phone number.";
      return false;
    }
    if (digits.length !== 10) {
      demoPhone.setCustomValidity("Phone number must be strictly 10 digits.");
      if (demoPhoneFeedback) demoPhoneFeedback.textContent = `Phone number must be strictly 10 digits (currently ${digits.length}/10).`;
      return false;
    }
    demoPhone.setCustomValidity("");
    return true;
  }

  if (demoEmail) {
    demoEmail.addEventListener("keydown", (e) => {
      if (e.key === " ") e.preventDefault();
    });
    demoEmail.addEventListener("input", () => {
      demoEmail.value = demoEmail.value.replace(/\s/g, "");
      validateDemoEmailField();
    });
    demoEmail.addEventListener("blur", () => {
      validateDemoEmailField();
    });
  }

  if (demoPhone) {
    demoPhone.addEventListener("input", () => {
      demoPhone.value = demoPhone.value.replace(/\D/g, "").slice(0, 10);
      validateDemoPhoneField();
    });
    demoPhone.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData("text") || "";
      const trimmed = pasteData.trim();
      if (trimmed.startsWith("+") && demoCountryCode) {
        const match = trimmed.match(/^\+(\d{1,4})[\s.-]?(\d{10})$/);
        if (match) {
          const code = "+" + match[1];
          const opt = Array.from(demoCountryCode.options).find(o => o.value === code);
          if (opt) demoCountryCode.value = opt.value;
          demoPhone.value = match[2];
          validateDemoPhoneField();
          return;
        }
      }
      const digits = pasteData.replace(/\D/g, "");
      demoPhone.value = digits.slice(-10);
      validateDemoPhoneField();
    });
    demoPhone.addEventListener("blur", () => {
      validateDemoPhoneField();
    });
  }

  if (scheduleDemoForm) {
    scheduleDemoForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailValid = validateDemoEmailField();
      const phoneValid = validateDemoPhoneField();

      if (!scheduleDemoForm.checkValidity() || !emailValid || !phoneValid) {
        e.stopPropagation();
        scheduleDemoForm.classList.add("was-validated");
        if (!emailValid && demoEmail) demoEmail.focus();
        else if (!phoneValid && demoPhone) demoPhone.focus();
        return;
      }

      const formData = new FormData(scheduleDemoForm);
      const payload = Object.fromEntries(formData.entries());

      const selectedCountryCode = payload.countryCode || (demoCountryCode ? demoCountryCode.value : "+1");
      const phoneDigits = (payload.phoneNumber || demoPhone.value || "").trim().replace(/\D/g, "");
      payload.phone = `${selectedCountryCode} ${phoneDigits}`;

      btnSubmitDemo.disabled = true;
      const btnText = btnSubmitDemo.querySelector(".btn-text");
      const btnSpinner = btnSubmitDemo.querySelector(".spinner-border");
      if (btnText) btnText.textContent = "Transmitting to sales@bluwis.com...";
      if (btnSpinner) btnSpinner.classList.remove("d-none");
      if (demoFormStatus) {
        demoFormStatus.classList.add("d-none");
        demoFormStatus.className = "alert d-none mt-3 mb-0";
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
          if (demoModalHeaderContent) {
            demoModalHeaderContent.classList.add("d-none");
          }

          if (demoFormContainer && demoSuccessContainer) {
            const leadNameSpan = document.getElementById("demoSuccessLeadName");
            const leadEmailSpan = document.getElementById("demoSuccessLeadEmail");
            if (leadNameSpan) leadNameSpan.textContent = payload.name;
            if (leadEmailSpan) leadEmailSpan.textContent = payload.email;

            demoFormContainer.classList.add("d-none");
            demoSuccessContainer.classList.remove("d-none");
          }
          scheduleDemoForm.reset();
          scheduleDemoForm.classList.remove("was-validated");
        } else {
          if (demoFormStatus) {
            demoFormStatus.textContent = result.message || "Failed to submit request. Please try again.";
            demoFormStatus.className = "alert alert-danger mt-3 mb-0";
            demoFormStatus.classList.remove("d-none");
          }
        }
      } catch (err) {
        console.error("Demo submission error:", err);
        if (demoFormStatus) {
          demoFormStatus.textContent = "Network error. Please try again or reach out to sales@bluwis.com directly.";
          demoFormStatus.className = "alert alert-danger mt-3 mb-0";
          demoFormStatus.classList.remove("d-none");
        }
      } finally {
        btnSubmitDemo.disabled = false;
        if (btnText) btnText.textContent = "Confirm & Schedule Demo";
        if (btnSpinner) btnSpinner.classList.add("d-none");
      }
    });

    const scheduleDemoModalEl = document.getElementById("scheduleDemoModal");
    if (scheduleDemoModalEl) {
      scheduleDemoModalEl.addEventListener("hidden.bs.modal", () => {
        if (demoModalHeaderContent) {
          demoModalHeaderContent.classList.remove("d-none");
        }
        if (demoFormContainer && demoSuccessContainer) {
          demoFormContainer.classList.remove("d-none");
          demoSuccessContainer.classList.add("d-none");
        }
        if (demoFormStatus) {
          demoFormStatus.classList.add("d-none");
        }
        scheduleDemoForm.reset();
        scheduleDemoForm.classList.remove("was-validated");
      });
    }
  }

  /* =========================================================================
     Platform Video Modal Handler
     ========================================================================= */
  const platformVideoModalEl = document.getElementById("platformVideoModal");
  if (platformVideoModalEl) {
    const modalVideo = document.getElementById("modalPlatformVideo");
    platformVideoModalEl.addEventListener("shown.bs.modal", () => {
      if (modalVideo) {
        modalVideo.play().catch(() => {});
      }
    });
    platformVideoModalEl.addEventListener("hidden.bs.modal", () => {
      if (modalVideo && !modalVideo.paused) {
        modalVideo.pause();
      }
    });

    // Auto-open modal if requested via hash
    if (window.location.hash === "#platformVideoModal" && typeof bootstrap !== "undefined") {
      setTimeout(() => {
        const modalInstance = bootstrap.Modal.getOrCreateInstance(platformVideoModalEl);
        modalInstance.show();
      }, 350);
    }
  }

  /* =========================================================================
     Smooth High-Performance Product Hero Video Player
     - Permanent Muted Audio
     - Continuous Loop
     - Pause on Mouse Hover / Resume on Mouse Leave
     - Pause offscreen for 60fps performance
     ========================================================================= */
  const platformVideo = document.getElementById("platformVideoPlayer");
  const platformVideoFrame = document.getElementById("platformVideoFrame") || (platformVideo ? platformVideo.closest(".browser-card") : null);

  if (platformVideo) {
    // 1. Keep audio strictly muted and video looping
    platformVideo.muted = true;
    platformVideo.loop = true;
    platformVideo.playsInline = true;

    // 2. Pause video when mouse hovers over that part, resume when mouse leaves
    let isHovering = false;
    let isOffscreen = false;
    const hoverTarget = platformVideoFrame || platformVideo;

    hoverTarget.addEventListener("mouseenter", () => {
      isHovering = true;
      platformVideo.pause();
    });

    hoverTarget.addEventListener("mouseleave", () => {
      isHovering = false;
      if (!isOffscreen) {
        platformVideo.play().catch(() => {});
      }
    });

    // Direct tap/click toggles playback as well
    platformVideo.addEventListener("click", () => {
      if (platformVideo.paused) {
        platformVideo.play().catch(() => {});
      } else {
        platformVideo.pause();
      }
    });

    // 3. IntersectionObserver: pause when offscreen, resume when in view
    if ("IntersectionObserver" in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isOffscreen = false;
            if (!isHovering) {
              platformVideo.play().catch(() => {});
            }
          } else {
            isOffscreen = true;
            if (!platformVideo.paused) {
              platformVideo.pause();
            }
          }
        });
      }, { threshold: 0.15 });

      videoObserver.observe(platformVideo);
    }
  }
});