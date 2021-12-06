/**
 * gh-index
 * An directory index for gh-pages.
 */

 window.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.getElementById('gh-index')

  function insertStylesheet (url) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = url
    document.head.appendChild(link)
  }

  function insertStylesheetAsync (url) {
    const raf = (function () {
      return window.requestAnimationFrame ||
             window.webkitRequestAnimationFrame ||
             window.mozRequestAnimationFrame ||
             function (callback) {
               window.setTimeout(callback, 1000 / 60)
             }
    })()
    raf(function () {
      insertStylesheet(url)
    })
  }

  function insertScript (url) {
    const script = document.createElement('script')
    script.src = url
    document.head.appendChild(script)
  }

  const index = {

    // RegExp for files to exclude
    excludes: new RegExp(wrapper.getAttribute('excludes')),

    /**
     * Init gh-index
     */
    init: function () {
      window.addEventListener('hashchange', index.hashRoute)

      insertStylesheet('http://amio.github.io/gh-index/index.css')
      // insertStylesheet('index.css')
      insertStylesheetAsync('https://octicons.github.com/components/octicons/octicons/octicons.css')
      window.fetch || insertScript('https://cdn.jsdelivr.net/fetch/0.9.0/fetch.min.js')

      index.loadTrees()
    },

    getRepoInfo: function () {
      const config = wrapper.getAttribute('repo') || wrapper.getAttribute('data-repo')
      if (!config) return null

      const repoInfo = config.split('/')
      return {
        owner: repoInfo[0],
        name: repoInfo[1],
        branch: 'gh-pages'
      }
    },

    loadTrees: function () {
      const repo = index.getRepoInfo()
      if (!repo) return window.alert('Repo config missing!')

      const uri = `https://api.github.com/repos/${repo.owner}/${repo.name}` +
        `/git/trees/${repo.branch}?recursive=1`
      window.fetch(uri, {cache: 'force-cache'})
        .then(resp => resp.json())
        .then(result => {
          index.refresh(result.tree)
        })
    },

    /**
     * Everything after data loaded.
     * @param resp
     */
    refresh: function (treeData) {
      // build tree
      index.tree = index.genTree(treeData)

      // build html
      index.hashRoute()
    },

    /**
     * Route task depends on current hash
     */
    hashRoute: function () {
      var path = window.location.hash.substr(1).split('/')
      var sub = index.tree

      while (sub && path.length && path[0]) {
        sub = sub[path.shift()]
      }

      index.updateIndexies(sub)
    },

    /**
     * Generate entire tree base on node list array return by Github API.
     * @param {Array} treeArr
     * @returns {Object}
     */
    genTree: function (treeArr) {
      var root = {}
      for (var i = treeArr.length; i--;) {
        if (!this.excludes.test(treeArr[i].path)) {
          this.addItem(root, treeArr[i])
        }
      }

      return root
    },

    /**
     * Add an item into tree.
     * @param tree
     * @param item
     * @returns {*}
     */
    addItem: function (tree, item) {
      var parent = tree
      item.path.replace(/[^/]+/g, function (seg, idx) {
        parent[seg] || (parent[seg] = {})
        parent = parent[seg]
        return idx
      })

      parent['/NODE/'] = item

      return item
    },

    /**
     * Update list base on tree
     * @param tree
     */
    updateIndexies: function (tree) {
      // generate header html
      var path = window.location.hash.replace('#', '')
      var header = '<div class="header"><span>•_•</span></div>'
      var parentLink = '#' + path.replace(/[^/]+\/$/, '')
      if (path) {
        header = `<div class="header"><a class="uplink" href="${parentLink}">` +
          `${path}<span>←_←</span></a></div>`
      }

      // generate list html
      const repo = index.getRepoInfo()
      const home = 'http://' + repo.owner + '.github.io/' + repo.name + '/'
      const items = Object.keys(tree).map(key => {
        if (key === '/NODE/') return ''

        let node = tree[key]['/NODE/']
        let str = ''
        switch (node.type) {
          case 'blob':
            str = `<li class="blob"><a href="${home + node.path}">` +
              `<span class="octicon octicon-file-text"></span> ${node.path}</a></li>`
            break
          case 'tree':
            str = `<li class="tree"><a href="#${node.path}/">` +
              `<span class="octicon octicon-file-directory"></span> ${node.path}/</a></li>`
            break
        }
        return str
      }).join('')
      const list = `<ul>${items}</ul>`

      // Generate footer html
      const footer = '<div class="footer">' +
        '<a href="http://github.com/amio/gh-index">gh-index</a> ' +
        'by <a href="http://github.com/amio">amio</a></div>'

      // insert html
      wrapper.innerHTML = header + list + footer
    }
  }

  index.init()
})
