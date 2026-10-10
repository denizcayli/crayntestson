/* Crayn 4 asamali talep formu (wizard) */
(function () {
    'use strict';

    var form = document.getElementById('talepForm');
    if (!form) return;

    var totalSteps = parseInt(form.dataset.steps, 10) || 1;
    var current = 1;

    var prevBtn   = document.getElementById('talepPrev');
    var nextBtn   = document.getElementById('talepNext');
    var submitBtn = document.getElementById('talepSubmit');
    var counter   = document.getElementById('stepCounter');
    var formError = document.getElementById('talepFormError');

    function stepEl(n) {
        return form.querySelector('.talep-step[data-step="' + n + '"]');
    }

    function updateProgress() {
        for (var i = 1; i <= totalSteps; i++) {
            var dot = document.querySelector('.tlp-dot-step[data-dot="' + i + '"]');
            if (dot) {
                dot.classList.toggle('is-active', i === current);
                dot.classList.toggle('is-done', i < current);
            }
            var bar = document.querySelector('.tlp-bar-step[data-bar="' + i + '"]');
            if (bar) bar.classList.toggle('is-done', i < current);
        }
        if (counter) counter.textContent = 'Adım ' + current + '/' + totalSteps;
    }

    function showStep(n) {
        current = Math.min(Math.max(n, 1), totalSteps);
        for (var i = 1; i <= totalSteps; i++) {
            var el = stepEl(i);
            if (el) el.classList.toggle('hidden', i !== current);
        }
        prevBtn.classList.toggle('hidden', current === 1);
        prevBtn.classList.toggle('flex', current !== 1);
        nextBtn.classList.toggle('hidden', current === totalSteps);
        submitBtn.classList.toggle('hidden', current !== totalSteps);
        updateProgress();
        if (formError) formError.classList.add('hidden');
        window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
    }

    function clearError(fieldDiv) {
        var err = fieldDiv.querySelector('.field-error');
        if (err) { err.classList.add('hidden'); err.textContent = ''; }
    }

    function setError(fieldDiv, msg) {
        var err = fieldDiv.querySelector('.field-error');
        if (err) { err.textContent = msg; err.classList.remove('hidden'); }
    }

    // Bir alanin dolu olup olmadigini kontrol et
    function fieldHasValue(fieldDiv) {
        var radios = fieldDiv.querySelectorAll('input[type="radio"], input[type="checkbox"]');
        if (radios.length) {
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked) return true;
            }
            return false;
        }
        var input = fieldDiv.querySelector('input, textarea, select');
        return input && input.value.trim() !== '';
    }

    // Bir adimdaki zorunlu alanlari dogrula
    function validateStep(n) {
        var el = stepEl(n);
        if (!el) return true;
        var ok = true;
        el.querySelectorAll('.talep-field').forEach(function (fieldDiv) {
            var required = fieldDiv.querySelector('[data-required="1"]');
            if (!required) { clearError(fieldDiv); return; }
            if (fieldHasValue(fieldDiv)) {
                clearError(fieldDiv);
            } else {
                setError(fieldDiv, 'Bu alan zorunludur.');
                ok = false;
            }
        });
        return ok;
    }

    nextBtn.addEventListener('click', function () {
        if (validateStep(current)) showStep(current + 1);
    });

    prevBtn.addEventListener('click', function () {
        showStep(current - 1);
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validateStep(current)) return;

        submitBtn.disabled = true;
        var originalText = submitBtn.textContent;
        submitBtn.textContent = 'Gönderiliyor...';
        if (formError) formError.classList.add('hidden');

        fetch(form.action, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            },
            body: new FormData(form)
        })
        .then(function (res) {
            return res.json().then(function (data) { return { status: res.status, data: data }; });
        })
        .then(function (r) {
            if (r.status >= 200 && r.status < 300 && r.data.success) {
                if (r.data.type === 'redirect' && r.data.redirect) {
                    window.location.href = r.data.redirect;
                    return;
                }
                form.classList.add('hidden');
                var prog = document.getElementById('talepProgress');
                if (prog) prog.classList.add('hidden');
                var success = document.getElementById('talepSuccess');
                if (success) {
                    if (r.data.message) {
                        var msg = document.getElementById('talepSuccessMsg');
                        if (msg) msg.textContent = r.data.message;
                    }
                    success.classList.remove('hidden');
                    window.scrollTo({ top: success.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
                }
                return;
            }

            // Validasyon hatalari (422)
            if (r.status === 422 && r.data.errors) {
                var firstErrorStep = null;
                Object.keys(r.data.errors).forEach(function (key) {
                    var name = key.replace(/^fields\./, '');
                    var fieldDiv = form.querySelector('.talep-field[data-field="' + name + '"]');
                    if (fieldDiv) {
                        setError(fieldDiv, r.data.errors[key][0]);
                        var stepWrap = fieldDiv.closest('.talep-step');
                        if (stepWrap && firstErrorStep === null) {
                            firstErrorStep = parseInt(stepWrap.dataset.step, 10);
                        }
                    }
                });
                if (firstErrorStep) showStep(firstErrorStep);
                if (formError) {
                    formError.textContent = 'Lütfen işaretli alanları düzeltin.';
                    formError.classList.remove('hidden');
                }
            } else if (formError) {
                formError.textContent = 'Bir hata oluştu. Lütfen tekrar deneyin.';
                formError.classList.remove('hidden');
            }
        })
        .catch(function () {
            if (formError) {
                formError.textContent = 'Bağlantı hatası. Lütfen tekrar deneyin.';
                formError.classList.remove('hidden');
            }
        })
        .finally(function () {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    });

    // Kullanici alani doldurunca hatayi temizle
    form.addEventListener('input', function (e) {
        var fieldDiv = e.target.closest('.talep-field');
        if (fieldDiv && fieldHasValue(fieldDiv)) clearError(fieldDiv);
    });
    form.addEventListener('change', function (e) {
        var fieldDiv = e.target.closest('.talep-field');
        if (fieldDiv && fieldHasValue(fieldDiv)) clearError(fieldDiv);
    });

    showStep(1);
})();
