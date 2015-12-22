(function() {
  var EventEmitter, TextBuffer, TextPoint, TextRegion,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = TOS.EventEmitter;


  /*
  Vocab:
  * `row` - the 0-based index of a line.
  * `col` - the 0-based index of a column.
  
  Keeping points synchronized
  * when text is inserted at point A
    - point B must be moved down (if A contains newlines)
    - point B must be moved right (if A is on the same line)
  * when text is deleted forward at A
    - point B is moved up (if !same line and line was joined)
    - point B is moved left (if on same line)
  * when text is deleted backward at A
    - point B is moved up (if !same line and line was joined)
    - point B is moved left (if on same line)
   */

  TextBuffer = TextBuffer = (function(superClass) {
    extend(TextBuffer, superClass);

    function TextBuffer(owner, text, saveCursor, placeCursor) {
      this.saveCursor = saveCursor != null ? saveCursor : null;
      this.placeCursor = placeCursor != null ? placeCursor : null;
      EventEmitter(this);
      this._owner = owner;
      this.lines = [""];
      this.setText(text.replace(/\r/g, ""));
      this.undoStack = [];
      this.redoStack = [];
      this.currentSteps = [];
    }

    TextBuffer.prototype.point = function(row, col, anchor) {
      return new TextPoint(this, row, col, anchor);
    };

    TextBuffer.prototype.text = function(row, col) {
      var ref;
      if (row == null) {
        row = null;
      }
      if (col == null) {
        col = null;
      }
      if ((row != null) && (col != null)) {
        return (ref = this.lines[row]) != null ? ref[col] : void 0;
      } else if (row != null) {
        return this.lines[row];
      } else {
        return this.lines.join("\n");
      }
    };

    TextBuffer.prototype.lineCount = function() {
      return this.lines.length;
    };

    TextBuffer.prototype.lineLength = function(row) {
      var ref;
      if (row == null) {
        throw new Error("TextBuffer#lineLength() needs a row number");
      }
      return (ref = this.text(row)) != null ? ref.length : void 0;
    };

    TextBuffer.prototype.search = function(match, startRow, startCol) {
      if (startRow == null) {
        startRow = 0;
      }
      if (startCol == null) {
        startCol = 0;
      }
      if (match instanceof RegExp) {
        return this.searchRegex(match, startRow, startCol);
      } else {
        return this.searchText(match, startRow, startCol);
      }
    };

    TextBuffer.prototype.searchText = function(subText, startRow, startCol) {
      var begin, end, length, maxRow, result, text;
      text = this.text(startRow).substr(startCol);
      maxRow = this.lineCount();
      while (startRow < maxRow) {
        result = text.indexOf(subText);
        if (~result) {
          length = subText.length;
          begin = this.point(startRow, startCol + result);
          end = this.point(startRow, startCol + result + length);
          return new TextRegion(begin, end);
        }
        startCol = 0;
        text = this.text(++startRow);
      }
      return null;
    };

    TextBuffer.prototype.searchRegex = function(regex, startRow, startCol) {
      var begin, end, index, length, maxRow, region, result, text;
      text = this.text(startRow).substr(startCol);
      maxRow = this.lineCount();
      while (startRow < maxRow) {
        result = regex.exec(text);
        if (result) {
          length = result[0].length;
          index = result.index;
          begin = this.point(startRow, startCol + index);
          end = this.point(startRow, startCol + index + length);
          region = new TextRegion(begin, end);
          region.captures = result;
          return region;
        }
        startCol = 0;
        text = this.text(++startRow);
      }
      return null;
    };

    TextBuffer.prototype.searchAll = function(match) {
      var col, region, regions, row;
      regions = [];
      row = 0;
      col = 0;
      while (region = this.search(match, row, col)) {
        regions.push(region);
        row = region.end.row;
        col = region.end.col;
      }
      return regions;
    };

    TextBuffer.prototype.replace = function(match, newText, startRow, startCol) {
      var capture, i, j, len, matchRegion, ref;
      if (startRow == null) {
        startRow = 0;
      }
      if (startCol == null) {
        startCol = 0;
      }
      matchRegion = this.search(match, startRow, startCol);
      if (!matchRegion) {
        return null;
      }
      if (matchRegion.captures) {
        ref = matchRegion.captures;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          capture = ref[i];
          newText = newText.replace(new RegExp("[$]" + i, "g"), capture);
        }
      }
      matchRegion.replaceWith(newText);
      return matchRegion;
    };

    TextBuffer.prototype.replaceAll = function(match, newText, startRow, startCol) {
      var matchRegion, replacementCount;
      if (startRow == null) {
        startRow = 0;
      }
      if (startCol == null) {
        startCol = 0;
      }
      replacementCount = 0;
      while (matchRegion = this.replace(match, newText, startRow, startCol)) {
        startRow = matchRegion.end.row;
        startCol = matchRegion.end.col;
        replacementCount++;
      }
      return replacementCount;
    };

    TextBuffer.prototype.deleteLine = function(row) {
      var line;
      line = this.text(row);
      if (row === 0 && this.lineCount() === 1) {
        this.setLine(0, "");
      } else {
        this.lines.splice(row, 1);
        if (!this.noHistory) {
          this.currentSteps.push({
            type: "delete",
            row: row,
            oldText: line
          });
        }
        this.emit("line:delete", row);
      }
      return line;
    };

    TextBuffer.prototype.setLine = function(row, text) {
      var oldText;
      oldText = this.text(row);
      this.lines[row] = text;
      if (!this.noHistory) {
        this.currentSteps.push({
          type: "change",
          row: row,
          oldText: oldText,
          newText: text
        });
      }
      this.emit("line:change", row, text);
    };

    TextBuffer.prototype.insertLine = function(row, text) {
      this.lines.splice(row, 0, text);
      if (!this.noHistory) {
        this.currentSteps.push({
          type: "insert",
          row: row,
          newText: text
        });
      }
      this.emit("line:insert", row, text);
    };

    TextBuffer.prototype.setText = function(text) {
      this.lines = text.split("\n");
      return this.emit("reset");
    };

    TextBuffer.prototype.undo = function() {
      var j, len, prev, ref, step, steps;
      this.commitTransaction();
      steps = this.undoStack.pop();
      if (!steps) {
        return;
      }
      this.redoStack.push(steps);
      this.noHistory = true;
      ref = steps.slice().reverse();
      for (j = 0, len = ref.length; j < len; j++) {
        step = ref[j];
        switch (step.type) {
          case "change":
            this.setLine(step.row, step.oldText);
            break;
          case "delete":
            this.insertLine(step.row, step.oldText);
            break;
          case "insert":
            this.deleteLine(step.row);
        }
      }
      if ((prev = this.undoStack[this.undoStack.length - 1]) && prev.cursor) {
        this.placeCursor(prev.cursor);
      }
      return this.noHistory = false;
    };

    TextBuffer.prototype.redo = function() {
      var j, len, ref, step, steps;
      steps = this.redoStack.pop();
      if (!steps) {
        return;
      }
      this.undoStack.push(steps);
      this.noHistory = true;
      ref = steps.slice();
      for (j = 0, len = ref.length; j < len; j++) {
        step = ref[j];
        switch (step.type) {
          case "change":
            this.setLine(step.row, step.newText);
            break;
          case "delete":
            this.deleteLine(step.row);
            break;
          case "insert":
            this.insertLine(step.row, step.newText);
        }
      }
      if (steps.cursor) {
        this.placeCursor(steps.cursor);
      }
      return this.noHistory = false;
    };

    TextBuffer.prototype.commitTransaction = function() {
      if (!this.currentSteps.length) {
        return;
      }
      if (this.saveCursor) {
        this.currentSteps.cursor = this.saveCursor();
      }
      this.undoStack.push(this.currentSteps);
      return this.currentSteps = [];
    };

    TextBuffer.prototype.insert = function(text, row, col) {
      var i, insertedLineCount, insertedLines, j, lastLine, lastRow, len, line, ref, textAfter, textBefore;
      line = this.text(row);
      textBefore = line.substr(0, col);
      textAfter = line.substr(col);
      if (!~text.indexOf("\n")) {
        this.setLine(row, textBefore + text + textAfter);
        return this.point(row, textBefore.length + text.length);
      } else {
        insertedLines = text.split("\n");
        insertedLineCount = insertedLines.length;
        this.setLine(row, textBefore + insertedLines[0]);
        ref = insertedLines.slice(1, -1);
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          line = ref[i];
          this.insertLine(row + i + 1, line);
        }
        lastRow = row + insertedLineCount - 1;
        lastLine = insertedLines[insertedLineCount - 1];
        this.insertLine(lastRow, lastLine + textAfter);
        return this.point(lastRow, lastLine.length);
      }
    };

    TextBuffer.prototype.overwrite = function(text, row, col) {
      var line, textAfter, textBefore;
      line = this.text(row);
      textBefore = line.substr(0, col);
      textAfter = line.substr(col + text.length);
      this.setLine(row, textBefore + text + textAfter);
      return this.point(row, textBefore.length + text.length);
    };

    TextBuffer.prototype.insertNewLine = function(row, col) {
      var line, textAfter, textBefore;
      line = this.text(row);
      textBefore = line.substr(0, col);
      textAfter = line.substr(col);
      this.setLine(row, textBefore);
      return this.insertLine(row + 1, textAfter);
    };

    TextBuffer.prototype.joinLines = function(row) {
      var line, line2;
      line = this.text(row);
      line2 = this.text(row + 1);
      this.setLine(row, line + line2);
      return this.deleteLine(row + 1);
    };

    TextBuffer.prototype.wordAt = function(row, col, wordRe) {
      var index, isNext, length, line, match, ref, regex, region, text;
      if (wordRe == null) {
        wordRe = "\\w+";
      }
      if (row instanceof TextPoint) {
        ref = row, row = ref.row, col = ref.col;
      }
      line = this.text(row);
      regex = new RegExp("(" + wordRe + ")|(.)", "g");
      isNext = false;
      while (match = regex.exec(line)) {
        text = match[1] || match[2];
        index = match.index;
        length = text.length;
        if (isNext || (col <= index + length)) {
          region = new TextRegion(this.point(row, index), this.point(row, index + length));
          region.isSolid = !!match[1];
          if (!isNext && !region.isSolid && index + 1 !== line.length) {
            isNext = true;
            continue;
          }
          return region;
        }
      }
      return new TextRegion(this.point(row, col), this.point(row, col));
    };

    TextBuffer.prototype.shiftLinesUp = function(beginRow, endRow) {
      var prevLine;
      if (!beginRow) {
        return false;
      }
      prevLine = this.deleteLine(beginRow - 1);
      this.insertLine(endRow, prevLine);
      return true;
    };

    TextBuffer.prototype.shiftLinesDown = function(beginRow, endRow) {
      var nextLine;
      if (endRow === this.lineCount() - 1) {
        return false;
      }
      nextLine = this.deleteLine(endRow + 1);
      this.insertLine(beginRow, nextLine);
      return true;
    };

    TextBuffer.prototype.deleteLines = function(beginRow, endRow) {
      var i, j, ref, ref1;
      for (i = j = ref = beginRow, ref1 = endRow; ref <= ref1 ? j <= ref1 : j >= ref1; i = ref <= ref1 ? ++j : --j) {
        this.deleteLine(beginRow);
      }
    };

    return TextBuffer;

  })(EventEmitter);

  TextPoint = TextPoint = (function(superClass) {
    extend(TextPoint, superClass);

    function TextPoint(buffer, row1, col1, anchor1) {
      this.buffer = buffer;
      this.row = row1;
      this.col = col1;
      this.anchor = anchor1 != null ? anchor1 : true;
    }

    TextPoint.prototype.moveTo = function(row, col) {
      if (row instanceof TextPoint) {
        this.row = row.row;
        this.col = row.col;
        return this.emit("move");
      } else {
        if (row != null) {
          this.row = row;
        }
        if (col != null) {
          this.col = col;
        }
        return this.emit("move");
      }
    };

    TextPoint.prototype.equals = function(point) {
      return this.row === point.row && this.col === point.col;
    };

    TextPoint.prototype.isBefore = function(point) {
      var sameRow;
      sameRow = this.row === point.row;
      return this.row < point.row || (sameRow && this.col < point.col);
    };

    TextPoint.prototype.isAfter = function(point) {
      return !this.isBefore(point) && !this.equals(point);
    };

    TextPoint.prototype.clone = function() {
      return new TextPoint(this.buffer, this.row, this.col, this.anchor);
    };

    TextPoint.prototype.toString = function() {
      return "(" + this.row + ", " + this.col + ")";
    };

    TextPoint.prototype.round = function() {
      var lastCol, lastRow, newCol, newRow;
      newRow = null;
      newCol = null;
      lastRow = this.buffer.lineCount() - 1;
      lastCol = this.buffer.lineLength(this.row);
      if (this.row < 0) {
        newRow = 0;
      }
      if (this.col < 0) {
        newCol = 0;
      }
      if (this.row > lastRow) {
        newRow = lastRow;
      }
      if (this.col > lastCol) {
        newCol = lastCol;
      }
      if ((newRow != null) || (newCol != null)) {
        return this.moveTo(newRow, newCol);
      }
    };

    TextPoint.prototype.prevLoc = function() {
      if (this.col === 0) {
        if (this.row === 0) {
          return this.buffer.point(0, 0);
        } else {
          return this.buffer.point(this.row - 1, this.buffer.lineLength(this.row - 1));
        }
      } else {
        return this.buffer.point(this.row, this.col - 1);
      }
    };

    TextPoint.prototype.nextLoc = function() {
      if (this.col === this.buffer.lineLength(this.row)) {
        if (this.row === this.buffer.lineCount() - 1) {
          return this.buffer.point(this.row, this.col);
        } else {
          return this.buffer.point(this.row + 1, 0);
        }
      } else {
        return this.buffer.point(this.row, this.col + 1);
      }
    };

    TextPoint.prototype.moveToLineBegin = function() {
      this.idealCol = 0;
      return this.moveTo(null, 0);
    };

    TextPoint.prototype.moveToLineEnd = function() {
      this.idealCol = 0;
      return this.moveTo(null, this.buffer.lineLength(this.row));
    };

    TextPoint.prototype.moveLeft = function() {
      if (this.isAtDocBegin()) {
        return;
      }
      this.idealCol = 0;
      if (this.col === 0) {
        if (this.row) {
          return this.moveTo(this.row - 1, this.buffer.lineLength(this.row - 1));
        }
      } else {
        return this.moveTo(null, this.col - 1);
      }
    };

    TextPoint.prototype.moveRight = function() {
      if (this.isAtDocEnd()) {
        return;
      }
      this.idealCol = 0;
      if (this.col === this.buffer.lineLength(this.row)) {
        if (this.row < this.buffer.lineCount()) {
          return this.moveTo(this.row + 1, 0);
        }
      } else {
        return this.moveTo(null, this.col + 1);
      }
    };

    TextPoint.prototype.moveDown = function() {
      if (this.isAtLastLine()) {
        return this.moveToLineEnd();
      } else {
        return this.moveVertical(1);
      }
    };

    TextPoint.prototype.moveUp = function() {
      if (this.row === 0) {
        return this.moveToLineBegin();
      } else {
        return this.moveVertical(-1);
      }
    };

    TextPoint.prototype.moveVertical = function(amount) {
      var limit, newCol, newRow;
      if (!this.idealCol || this.col >= this.idealCol) {
        this.idealCol = this.col;
      }
      newRow = this.row + amount;
      newCol = this.col;
      if (this.idealCol > this.col) {
        newCol = this.idealCol;
      }
      if (this.col > (limit = this.buffer.lineLength(newRow))) {
        newCol = limit;
      }
      return this.moveTo(newRow, newCol);
    };

    TextPoint.prototype.moveToPrevWord = function() {
      var carat, char;
      if (this.isAtDocBegin()) {
        return;
      }
      carat = this.prevLoc();
      char = this.buffer.text(carat.row, carat.col);
      while (!char || !/\w/.test(char)) {
        carat = carat.prevLoc();
        if (carat.isAtDocBegin()) {
          return this.moveToDocBegin();
        }
        char = this.buffer.text(carat.row, carat.col);
      }
      return this.moveTo(this.buffer.wordAt(carat).begin);
    };

    TextPoint.prototype.moveToNextWord = function() {
      var carat, char;
      if (this.isAtDocEnd()) {
        return;
      }
      carat = this.clone();
      char = this.buffer.text(carat.row, carat.col);
      while (!char || !/\w/.test(char)) {
        carat = carat.nextLoc();
        if (carat.isAtDocEnd()) {
          return this.moveToDocEnd();
        }
        if (carat.isAtLineEnd()) {
          carat = carat.nextLoc();
        }
        char = this.buffer.text(carat.row, carat.col);
      }
      carat.moveRight();
      return this.moveTo(this.buffer.wordAt(carat).end);
    };

    TextPoint.prototype.moveToDocBegin = function() {
      return this.moveTo(0, 0);
    };

    TextPoint.prototype.moveToDocEnd = function() {
      var lastRow;
      lastRow = this.buffer.lineCount() - 1;
      return this.moveTo(lastRow, this.buffer.lineLength(lastRow));
    };

    TextPoint.prototype.isAtDocBegin = function() {
      return !this.row && !this.col;
    };

    TextPoint.prototype.isAtDocEnd = function() {
      var lastRow;
      lastRow = this.buffer.lineCount() - 1;
      return this.row === lastRow && this.col === this.buffer.lineLength(lastRow);
    };

    TextPoint.prototype.isAtLineEnd = function() {
      return this.col === this.buffer.lineLength(this.row);
    };

    TextPoint.prototype.isAtLastLine = function() {
      var lastRow;
      lastRow = this.buffer.lineCount() - 1;
      return this.row === lastRow;
    };

    TextPoint.prototype.insert = function(text) {
      return this.moveTo(this.buffer.insert(text, this.row, this.col));
    };

    TextPoint.prototype.overwrite = function(text) {
      return this.moveTo(this.buffer.overwrite(text, this.row, this.col));
    };

    TextPoint.prototype.deleteBack = function() {
      var col, line, row;
      if (this.isAtDocBegin()) {
        return;
      }
      row = this.row, col = this.col;
      this.moveLeft();
      if (col === 0) {
        return this.buffer.joinLines(row - 1);
      } else {
        line = this.buffer.text(row);
        return this.buffer.setLine(row, line.substr(0, col - 1) + line.substr(col));
      }
    };

    TextPoint.prototype.deleteForward = function() {
      var line;
      if (this.isAtDocEnd()) {
        return;
      }
      if (this.isAtLineEnd()) {
        return this.buffer.joinLines(this.row);
      } else {
        line = this.buffer.text(this.row);
        return this.buffer.setLine(this.row, line.substr(0, this.col) + line.substr(this.col + 1));
      }
    };

    TextPoint.prototype.deleteWordBack = function() {
      var colBegin, ptBegin, ptEnd, rowBegin;
      rowBegin = this.row;
      colBegin = this.col;
      this.moveToPrevWord();
      ptBegin = this.buffer.point(this.row, this.col);
      ptEnd = this.buffer.point(rowBegin, colBegin);
      return (new TextRegion(ptBegin, ptEnd))["delete"]();
    };

    TextPoint.prototype.deleteWordForward = function() {
      var colBegin, ptBegin, rowBegin;
      rowBegin = this.row;
      colBegin = this.col;
      this.moveToNextWord();
      ptBegin = this.buffer.point(rowBegin, colBegin);
      return (new TextRegion(ptBegin, this))["delete"]();
    };

    TextPoint.prototype.newLine = function() {
      this.buffer.insertNewLine(this.row, this.col);
      return this.moveTo(this.row + 1, 0);
    };

    return TextPoint;

  })(EventEmitter);

  TextRegion = TextRegion = (function() {
    function TextRegion(begin1, end1) {
      this.begin = begin1;
      this.end = end1;
      this.buffer = this.begin.buffer;
    }

    TextRegion.prototype.ordered = function() {
      if (this.begin.isBefore(this.end)) {
        return new TextRegion(this.begin, this.end);
      } else {
        return new TextRegion(this.end, this.begin);
      }
    };

    TextRegion.prototype.isEmpty = function() {
      return this.begin.equals(this.end);
    };

    TextRegion.prototype.text = function() {
      var begin, end, j, lines, ref, ref1, ref2, row;
      ref = this.ordered(), begin = ref.begin, end = ref.end;
      if (begin.row === end.row) {
        return this.buffer.text(begin.row).substring(begin.col, end.col);
      }
      lines = [];
      lines.push(this.buffer.text(begin.row).substring(begin.col));
      if (end.row - 1 >= begin.row + 1) {
        for (row = j = ref1 = begin.row + 1, ref2 = end.row - 1; ref1 <= ref2 ? j <= ref2 : j >= ref2; row = ref1 <= ref2 ? ++j : --j) {
          lines.push(this.buffer.text(row));
        }
      }
      lines.push(this.buffer.text(end.row).substring(0, end.col));
      return lines.join("\n");
    };

    TextRegion.prototype.replaceWith = function(text) {
      var afterText, beforeText, begin, delRow, end, j, lastLine, line, ref, ref1, ref2, row;
      ref = this.ordered(), begin = ref.begin, end = ref.end;
      line = this.buffer.text(begin.row);
      beforeText = line.substr(0, begin.col);
      if (begin.row === end.row) {
        afterText = line.substr(end.col);
      } else {
        lastLine = this.buffer.text(end.row);
        afterText = lastLine.substr(end.col);
      }
      if (begin.row !== end.row) {
        delRow = begin.row + 1;
        for (row = j = ref1 = delRow, ref2 = end.row; ref1 <= ref2 ? j <= ref2 : j >= ref2; row = ref1 <= ref2 ? ++j : --j) {
          this.buffer.deleteLine(delRow);
        }
      }
      this.buffer.setLine(begin.row, beforeText);
      end.moveTo(this.buffer.insert(text, begin.row, begin.col));
      this.buffer.insert(afterText, end.row, end.col);
    };

    TextRegion.prototype["delete"] = function() {
      return this.replaceWith("");
    };

    TextRegion.prototype.selectRow = function(row) {
      return this.selectRows(row, row);
    };

    TextRegion.prototype.selectRows = function(rowBegin, rowEnd) {
      var ref;
      if (rowBegin > rowEnd) {
        ref = [rowEnd, rowBegin], rowBegin = ref[0], rowEnd = ref[1];
      }
      this.begin.moveTo(rowBegin, 0);
      return this.end.moveTo(rowEnd, this.buffer.lineLength(rowEnd));
    };

    TextRegion.prototype.shiftLinesUp = function() {
      var begin, end, ref;
      ref = this.ordered(), begin = ref.begin, end = ref.end;
      if (!this.buffer.shiftLinesUp(begin.row, end.row)) {
        return;
      }
      begin.moveUp();
      return end.moveUp();
    };

    TextRegion.prototype.shiftLinesDown = function() {
      var begin, end, ref;
      ref = this.ordered(), begin = ref.begin, end = ref.end;
      if (!this.buffer.shiftLinesDown(begin.row, end.row)) {
        return;
      }
      begin.moveDown();
      return end.moveDown();
    };

    TextRegion.prototype.indent = function(tabChars) {
      var begin, end, j, ref, ref1, ref2, row;
      ref = this.ordered(), begin = ref.begin, end = ref.end;
      for (row = j = ref1 = begin.row, ref2 = end.row; ref1 <= ref2 ? j <= ref2 : j >= ref2; row = ref1 <= ref2 ? ++j : --j) {
        this.buffer.setLine(row, tabChars + this.buffer.text(row));
      }
      begin.moveTo(null, begin.col + tabChars.length);
      end.moveTo(null, end.col + tabChars.length);
    };

    TextRegion.prototype.outdent = function(tabChars) {
      var begin, beginCol, changed, end, endCol, j, line, oldLine, re, ref, ref1, ref2, row;
      ref = this.ordered(), begin = ref.begin, end = ref.end;
      re = new RegExp("^" + (tabChars.replace(/(.)/g, "[$1]?")));
      changed = false;
      for (row = j = ref1 = begin.row, ref2 = end.row; ref1 <= ref2 ? j <= ref2 : j >= ref2; row = ref1 <= ref2 ? ++j : --j) {
        oldLine = this.buffer.text(row);
        line = oldLine.replace(re, "");
        this.buffer.setLine(row, line);
        if (line !== oldLine) {
          changed = true;
        }
      }
      if (!changed) {
        return;
      }
      beginCol = begin.col - tabChars.length;
      if (beginCol < 0) {
        beginCol = 0;
      }
      endCol = end.col - tabChars.length;
      if (endCol < 0) {
        endCol = 0;
      }
      begin.moveTo(null, beginCol);
      return end.moveTo(null, endCol);
    };

    return TextRegion;

  })();

  module.exports = {
    TextBuffer: TextBuffer,
    TextPoint: TextPoint,
    TextRegion: TextRegion
  };

}).call(this);
