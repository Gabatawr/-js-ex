import 'focus-visible';
import { OAuth2Client } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import documentReady from './helpers/documentReady';

const bntEdit = document.querySelector('.books__btn-edit');
const bntDel = document.querySelector('.books__btn-del');
const btnModal = document.querySelector('.modal__btn-ok');
const tbody = document
  .querySelector('.books__table')
  .querySelector('tbody');

console.log(process.env);

const oauthClient = new OAuth2Client({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
});
oauthClient.credentials.refresh_token = process.env.REFRESH_TOKEN;
const sheetID = process.env.SHEET_ID;
let sheet = {};
const booklist = [];
const bookSelected = { id: '0' };

const trEventHendler = (e) => {
  const selectRow = tbody.querySelector('.row-selected');
  selectRow?.classList.toggle('row-selected');

  if (selectRow === e.target.parentNode) {
    bntEdit.disabled = true;
    bntDel.disabled = true;
    bookSelected.id = '0';
  } else {
    e.target.parentNode.classList.toggle('row-selected');
    bntEdit.disabled = false;
    bntDel.disabled = false;
    bookSelected.id = e.target.parentNode.firstChild.textContent;
  }
};

// #region linkActive
documentReady(() => {
  const sheetInit = async () => {
    const doc = new GoogleSpreadsheet(sheetID);
    await doc.useOAuth2Client(oauthClient);
    await doc.loadInfo();
    sheet = doc.sheetsByTitle.page1;
  };

  const tableInit = async () => {
    const rows = await sheet.getRows();

    rows.forEach((r) => {
      booklist.push(r);
      const tr = document.createElement('tr');
      tr.addEventListener('click', trEventHendler);
      tbody.appendChild(tr);

      for (let i = 0; i < 7; i += 1) {
        const th = document.createElement('th');
        tr.appendChild(th);
        th.textContent = [r.id, r.title, r.author, r.year, r.publisher, r.pages, r.count][i];
      }
    });
  };

  document
    .querySelector('.menu__list')
    .querySelectorAll('.menu__link')
    .forEach((link) => {
      if (window.location.href === link.href) {
        link.parentNode.classList.add('menu__item--active');
      }
    });

  const dialog = document.querySelector('dialog');
  const fields = dialog.querySelectorAll('.modal__input');

  bntEdit.addEventListener('click', () => {
    booklist.forEach((r) => {
      if (r.id === bookSelected.id) {
        fields.forEach((i) => {
          if (i.placeholder === 'Title') i.value = r.title;
          if (i.placeholder === 'Author') i.value = r.author;
          if (i.placeholder === 'Year') i.value = r.year;
          if (i.placeholder === 'Publisher') i.value = r.publisher;
          if (i.placeholder === 'Pages') i.value = r.pages;
        });
        btnModal.textContent = 'Edit book';
        dialog.open = true;
      }
    });
  });

  bntDel.addEventListener('click', () => {
    tbody.querySelectorAll('tr').forEach((tr) => {
      if (tr.firstChild.textContent === bookSelected.id) {
        tbody.removeChild(tr);
      }
    });

    booklist.forEach((r) => {
      if (r.id === bookSelected.id) {
        r.delete();
      }
    });
  });

  document.querySelector('.books__btn-add').addEventListener('click', () => {
    btnModal.textContent = 'Add book';
    dialog.open = true;
  });

  document.querySelector('.modal__btn-close').addEventListener('click', () => {
    fields.forEach((i) => { i.value = ''; });
    dialog.open = false;
  });

  btnModal.addEventListener('click', () => {
    if (btnModal.textContent === 'Add book') {
      const tr = document.createElement('tr');
      tr.addEventListener('click', trEventHendler);

      let th = document.createElement('th');
      tr.appendChild(th);
      th.textContent = +tbody.lastChild.firstChild.textContent + 1; // id

      tbody.appendChild(tr);
      for (let i = 0; i < 5; i += 1) {
        th = document.createElement('th');
        tr.appendChild(th);
        th.textContent = fields[i].value;
      }
      th = document.createElement('th');
      tr.appendChild(th);
      th.textContent = 1; // count

      const row = tr.querySelectorAll('th');
      (async function () {
        booklist.push(await sheet.addRow({
          id: row[0].textContent,
          title: row[1].textContent,
          author: row[2].textContent,
          year: row[3].textContent,
          publisher: row[4].textContent,
          pages: row[5].textContent,
          count: row[6].textContent,
        }));
      }());
    } else {
      tbody.querySelectorAll('tr').forEach((tr) => {
        if (tr.firstChild.textContent === bookSelected.id) {
          const rowTab = tr.querySelectorAll('th');
          const rowDB = booklist.find((r) => r.id === bookSelected.id);
          for (let i = 1; i < 6; i += 1) {
            rowTab[i].textContent = fields[i - 1].value;
          }
          rowDB.title = fields[0].value;
          rowDB.author = fields[1].value;
          rowDB.year = fields[2].value;
          rowDB.publisher = fields[3].value;
          rowDB.pages = fields[4].value;
          rowDB.save();
        }
      });
    }
    dialog.open = false;
  });

  (async function () {
    await sheetInit();
    await tableInit();
  }());
});
// #endregion linkActive
