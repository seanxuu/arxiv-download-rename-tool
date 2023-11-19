// ==UserScript==
// @name         arxiv-download-rename-tool
// @name:zh-CN   	arxiv论文下载重命名工具
// @name:zh-TW    	arxiv論文下載重命名工具
// @name:en      	arxiv-download-rename-tool
// @namespace   https://www.tampermonkey.net/
// @version      0.7
// @description  When you download a paper from arxiv.org, it can rename the pdf to the form [date + paper title]
// @description:zh-CN   当您从arxiv.org下载论文时，它可以将pdf重命名为【日期+论文标题】的形式
// @description:zh-tw   當您從arxiv.org下載論文時，它可以將pdf重命名為【日期+論文標題】的形式
// @description:en  When you download a paper from arxiv.org, it can rename the pdf to the form [date + paper title]
// @author       Sean
// @match        *://arxiv.org/abs/*
// @match        *://arxiv.org/search/*
// @match        *://arxiv.org/list/*
// @icon         https://static.arxiv.org/static/browse/0.3.4/images/icons/favicon-32x32.png
// @grant        none
// @homepage     https://github.com/seanxuu/arxiv-download-rename-tool
// @license      AGPL License
// ==/UserScript==

(function () {
  "use strict";
  const url = location.pathname,
    webTitle = document.title;
  var downloadName = "",
    downloadPath = "";
  var papertitle = "",
    papertime = "";
  if (url.search("/abs/") != -1) {
    papertitle = document.querySelector("#abs > h1").innerText;
    downloadPath = window.location.href.replace("abs", "pdf") + ".pdf"; //document.querySelector("#abs-outer > div.extra-services > div.full-text > ul > li:nth-child(1) > a")+'.pdf'
    papertime = window.location.pathname.slice(5, 9); //document.querySelector("#abs > div.metatable > table > tbody > tr:nth-child(3) > td.tablecell.arxivid > span > a").innerText.slice(6,10)
    downloadName = renamePaperFile(papertitle, papertime);
    addDownloadButton(
      downloadPath,
      downloadName,
      document.querySelector("#abs-outer > div.extra-services > div.full-text")
    );
  }
  if (url.search("/search/") != -1) {
    var paperlist = document.querySelectorAll(
      "#main-container > div.content > ol > li"
    );
    for (let i = 0; i < paperlist.length; i++) {
      let listItem = paperlist[i];
      try {
        papertitle = listItem.children[1].textContent.trim();
        papertime = listItem.children[0].innerText.slice(6, 10);
      } catch (error) {
        console.log(papertitle, i);
        console.log(listItem.children[0]);
      }
      papertime = listItem.children[0].innerText.slice(6, 10);
      downloadName = renamePaperFile(papertitle, papertime);
      try {
        downloadPath =
          listItem.children[0].children[0].children[1].children[0].getAttribute(
            "href"
          );
      } catch (error) {
        downloadPath = listItem.children[0].children[0].children[0].href;
        downloadPath = downloadPath.replace("abs", "pdf");
      }
      addDownloadButton(downloadPath, downloadName, listItem.children[0]);
    }
  }
  if (url.search("/list/") != -1) {
    let paperlist = document.querySelectorAll(".list-identifier");
    for (let i = 0, len = paperlist.length; i < len; i++) {
      try {
        let paper = paperlist[i];
        papertitle =
          paper.parentNode.nextElementSibling.querySelector(
            ".list-title"
          ).innerText;
        downloadPath =
          paper.querySelector('a[title="Download PDF"]').href + ".pdf";
        papertime = downloadPath.split("/").pop().split(".")[0];
        downloadName = renamePaperFile(papertitle, papertime);
        addDownloadButton(downloadPath, downloadName, paper);
      } catch (error) {
        console.warn("AUTO download rename raise warning at : " + papertitle);
      }
    }
  }

  function addDownloadButton(downloadPath, downloadName, element) {
    var button = document.createElement("a");
    button.id = "downloadPaper";
    button.textContent = "⏬Download paper with a new name⏬";
    button.setAttribute("href", downloadPath);
    button.setAttribute("download", downloadName);
    element.append(button);
  }
  function renamePaperFile(name, time) {
    var downloadName = name.replace(": ", "：");
    downloadName = downloadName.replace(":", "：");
    downloadName = downloadName.replace("?", "？");
    downloadName = downloadName.replace("/", " OR ");
    downloadName = downloadName.replace('"', "“") + ".pdf";
    return "[" + time + "]" + downloadName;
  }
})();
