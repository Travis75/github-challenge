$(document).ready(function(){
  // create controller make ajax call with wrapper function
  var controller = new DataController()
  controller.ajaxCall("GET", "https://api.github.com/search/repositories?q=forks:5+language:ruby&per_page=50&sort=stars&order=desc")
  .done(function(data){
    // with data from Github call create data Model/format and send info back to view
    rubyRepos = new repoModel(data.items)
    controller.createView("#template", "#info_holder", rubyRepos.formatted)
    // section below deals with grabbing the largest contributor. Instead of making 50 extra ajax calls I decided to allow you to click for the largest contributor.
    $('a div').on('click', function(e){
      e.preventDefault();
      var self = this;
      controller.ajaxCall("GET", $(this).parent().attr('href')).done(function(contribData){
        // grab contribution data and run it through logic and formatting to find #1 contributor.
        var mostContributions = topContributor(contribData)
        showContributor(mostContributions, $(self).parent().parent(), self)
      })
    })
  })
})

// controller - holds view as well because scope is so small
function DataController(){
}

DataController.prototype.ajaxCall = function (type, url){
  var ajax = $.ajax({
    type: type,
    url: url
  })
  return ajax
}

DataController.prototype.createView = function(chosenTemplate, chosenDestination, dataToUse) {
    var source   = $(chosenTemplate).html();
    var template = Handlebars.compile(source);
    $(chosenDestination).append(template(dataToUse))
}


// repository info model
function repoModel(data) {
  this.data = data
  this.formatted = this.format()
}

repoModel.prototype.format = function(){
  var holder = {repos: []}
  for(i=0; i < this.data.length; i++){
    holder.repos.push({url: this.data[i].html_url, name: this.data[i].name, description: this.data[i].description, count: i+1, forks: this.data[i].forks, contributors: this.data[i].contributors_url})
  }
  return holder
}

// Functions related to grabbing contributors and view
function topContributor(data){
  var contribHolder = {}
  var largestContributor = 0
  for (i=0; i < data.length; i++){
    if (data[i].contributions > largestContributor){
      largestContributor = data[i].contributions
    }
    contribHolder[data[i].contributions] = data[i].login
  }
  return {name: contribHolder[largestContributor], contributions: largestContributor}
}

function showContributor(mostContributions, whereAppend, elementRemove){
  $(elementRemove).fadeOut(1000, function() {
    $(elementRemove).remove();
    $("<div> <b>" + mostContributions.name + ":</b> " + mostContributions.contributions + "</div>").hide().appendTo(whereAppend).fadeIn(1000);
  })
}

