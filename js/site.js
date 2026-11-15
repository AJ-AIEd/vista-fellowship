// Behaviour for the public pages: the licence and pilot inquiry form on /schools.
// The form sends nothing itself. It composes an email in the visitor's own mail app,
// or, if no address is configured, shows the message so it can be copied.
(function () {
  const form = document.getElementById('inquiryForm');
  if (!form) return;
  const out = document.getElementById('inquiryOutput'), note = document.getElementById('inquiryNote');
  const email = (window.VISTA_SITE && window.VISTA_SITE.inquiryEmail || '').trim();
  const copy = document.getElementById('inquiryCopy');
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const v = name => (form.elements[name].value || '').trim();
    const body = [
      'VISTA school inquiry', '',
      'Name: ' + v('name'), 'Role: ' + v('role'), 'School: ' + v('school'), 'Country: ' + v('country'),
      'Reply to: ' + v('reply'), 'Interested in: ' + v('interest'), 'Approximate number of teachers: ' + v('teachers'), '',
      'What we are trying to address:', v('context')
    ].join('\n');
    out.textContent = body; out.hidden = false; copy.hidden = false;
    if (email) {
      note.textContent = 'Your email app should open with this message. If it does not, copy the text below and send it to ' + email + '.';
      window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent('VISTA school inquiry: ' + v('school')) + '&body=' + encodeURIComponent(body);
    } else {
      note.textContent = 'The inquiry address has not been published on this preview yet, so nothing has been sent. Copy the message below and send it to your VISTA contact.';
    }
    out.focus();
  });
  copy.addEventListener('click', function () {
    navigator.clipboard.writeText(out.textContent).then(function () { note.textContent = 'Copied.'; }, function () { note.textContent = 'Select the text below and copy it.'; });
  });
})();
