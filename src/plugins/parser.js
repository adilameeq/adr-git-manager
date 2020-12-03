import antlr4 from 'antlr4';
import MADRLexer from './parser/MADRLexer.js';
import MADRParser from './parser/MADRParser.js';
import MADRListener from './parser/MADRListener.js';
import { ArchitecturalDecisionRecord } from './classes.js';


/**
 * Creates an ADR from a ParseTree by listening to a ParseTreeWalker.
 * 
 * Use with '''antlr4.tree.ParseTreeWalker.DEFAULT.walk(generator, parseTree);'''
 * The parsed ADR is saved in the attribute 'adr'.
 */
class MADRGenerator extends MADRListener {

    constructor() {
        super()
        this.adr = new ArchitecturalDecisionRecord()
    }

    enterTitle(ctx) {
        this.adr.title = ctx.getText()
    }

    enterStatus(ctx) {
        this.adr.status = ctx.getText()
    }

    enterDeciders(ctx) {
        this.adr.deciders = ctx.getText()
    }

    enterDate(ctx) {
        this.adr.date = ctx.getText()
    }

    enterTechnicalStory(ctx) {
        this.adr.technicalStory = ctx.getText()
    }

    enterContextAndProblemStatement(ctx) {
        this.adr.contextAndProblemStatement = ctx.getText();
    }

    enterDecisionDrivers(ctx) {
        this.addListItemsFromListToList(ctx.children[0], this.adr.decisionDrivers)
    }

    enterConsideredOptions(ctx) {
        let tmpOptionList = []
        this.addListItemsFromListToList(ctx.children[0], tmpOptionList)
        tmpOptionList.forEach(opt => this.adr.addOption({ title: opt }))
    }

    enterChosenOption(ctx) {
        this.adr.decisionOutcome.chosenOption = ctx.getText()
    }

    enterChosenOptionAndExplanation(ctx) {
        let rawDecisionOutcome = ctx.getText()

        if (rawDecisionOutcome.startsWith('Chosen option: ')) {
            rawDecisionOutcome = rawDecisionOutcome.split(/, because */)
            rawDecisionOutcome[0] = rawDecisionOutcome[0].substring('Chosen option: '.length).trim() // Remove 'Chosen option: '
            let delim = rawDecisionOutcome[0].charAt(0)
            let chosenOption = ""

            if (delim === rawDecisionOutcome[0].charAt(rawDecisionOutcome[0].length - 1)) {
                chosenOption = rawDecisionOutcome[0].substring(1, rawDecisionOutcome[0].length - 1)
            } else {
                chosenOption = rawDecisionOutcome[0]
            }
            let explanation = rawDecisionOutcome.slice(1).join()
            this.adr.decisionOutcome.chosenOption = chosenOption
            this.adr.decisionOutcome.explanation = explanation
        } else {
            console.log('Couldn\'t find chosen option.')
        }
    }

    enterPositiveConsequences(ctx) {
        this.addListItemsFromListToList(ctx.children[0], this.adr.decisionOutcome.positiveConsequences)
    }

    enterNegativeConsequences(ctx) {
        this.addListItemsFromListToList(ctx.children[0], this.adr.decisionOutcome.negativeConsequences)
    }

    enterOptionTitle(ctx) {
        // console.log('Option Title in Pros and Cons: ', ctx.getText())
        this.currentOption = this.getMostSimilarOptionTo(ctx.getText())
    }

    enterOptionDescription(ctx) {
        if (this.currentOption) {
            this.currentOption.description = ctx.getText()
        }
    }

    enterProlist(ctx) {
        if (this.currentOption) {
            this.addListItemsFromListToList(ctx, this.currentOption.pros)
        }
    }

    enterConlist(ctx) {
        if (this.currentOption) {
            this.addListItemsFromListToList(ctx, this.currentOption.cons)
        }
    }

    enterLinks(ctx) {
        this.addListItemsFromListToList(ctx.children[0], this.adr.links)
    }
    /**
     * 
     * @param {string} optTitle 
     */
    getMostSimilarOptionTo(optTitle) {
        // Find the option that has a similar enough title.
        let opt = this.adr.consideredOptions.find(function (opt) {
            return this.matchOptionTitle(opt.title, optTitle)
        }, this);
        if (opt) { // If a fitting option was found, return it.
            return opt;
        } else {
            // If no fitting option is found, create a new option and return it.
            return this.adr.addOption({ title: optTitle })
        }
    }
    /**
     * 
     * @param {string} optTitle1 
     * @param {string} optTitle2 
     * @returns {boolean} True, iff the option titles are similar
     */
    matchOptionTitle(optTitle1, optTitle2) {
        let trimmed1 = optTitle1.replace(/ /g, '').toLowerCase() // Remove whitespaces and lower-case heading
        let trimmed2 = optTitle2.replace(/ /g, '').toLowerCase()
        return trimmed1 === trimmed2 || trimmed1.startsWith(trimmed2) || trimmed2.startsWith(trimmed1)
    }

    /**
     * 
     * @param {} parseTreeList - a list node in the parse tree.
     * @param {string[]} targetList - a js array, where each list entry is copied into.
     */
    addListItemsFromListToList(parseTreeList, targetList) {
        for (let i = 0; i < parseTreeList.children.length; i++) {
            if (parseTreeList.children[i].ruleIndex === MADRParser.ruleNames.indexOf('textLine')) { // if it is not a token 
                targetList.push(parseTreeList.children[i].getText())
            }
        }
    }
}

/**
 * Converts an markdown into an ADR object.
 * @param {string} md 
 * @returns {ArchitecturalDecisionRecord}
 */
export function md2adr(md) {
    const chars = new antlr4.InputStream(md);
    const lexer = new MADRLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new MADRParser(tokens);
    parser.buildParseTrees = true;
    const tree = parser.start(); // 'start' is the name of the starting rule.
    // console.log('Created Parse Tree! ', tree)
    const printer = new MADRGenerator();
    antlr4.tree.ParseTreeWalker.DEFAULT.walk(printer, tree);
    // console.log('Result ADR ', printer.adr)
    return printer.adr;
}

export function adr2md(adr) {
    var md = '# ' + adr.title + '\n'
    if (adr.status !== '' && adr.status !== 'null') {
        md = md.concat('\n* Status: ' + adr.status)
    }
    if (adr.deciders.length > 0) {
        md = md.concat('\n* Deciders: ' + adr.deciders)
    }
    if (adr.date !== '') {
        md = md.concat('\n* Date: ' + adr.date + '\n')
    }
    if (adr.technicalStory !== '') {
        md = md.concat('\nTechnical Story: ' + adr.technicalStory + '\n')
    }

    if (adr.contextAndProblemStatement !== '') {
        md = md.concat('\n## Context and Problem Statement\n\n' + adr.contextAndProblemStatement + '\n')
    }

    if (adr.decisionDrivers.length > 0) {
        md = md.concat('\n## Decision Drivers\n\n')
        for (let i in adr.decisionDrivers) {
            md = md.concat('* ' + adr.decisionDrivers[i] + '\n')
        }
    }

    if (adr.consideredOptions.length > 0) {
        md = md.concat('\n## Considered Options\n\n')
        md = adr.consideredOptions.reduce((total, opt) => (total + '* ' + opt.title + '\n'), md)
    }

    md = md.concat('\n## Decision Outcome\n\nChosen option: "' + adr.decisionOutcome.chosenOption)

    if (adr.decisionOutcome.explanation.trim() !== '') {
        md = md.concat('", because ' + adr.decisionOutcome.explanation + '\n')
    } else {
        md = md.concat('"\n')
    }


    if (adr.decisionOutcome.positiveConsequences.length > 0) {
        md = md.concat('\n### Positive Consequences\n\n')
        md = adr.decisionOutcome.positiveConsequences.reduce((total, con) => (total + '* ' + con + '\n'), md)

    }
    if (adr.decisionOutcome.negativeConsequences.length > 0) {
        md = md.concat('\n### Negative Consequences\n\n')
        md = adr.decisionOutcome.negativeConsequences.reduce((total, con) => (total + '* ' + con + '\n'), md)
    }

    if (adr.consideredOptions.some((opt) => (opt.description !== '' || opt.pros.length > 0 || opt.cons.length > 0))) {
        md = md.concat('\n## Pros and Cons of the Options\n')
        md = adr.consideredOptions.reduce((total, opt) => {
            if (opt.description !== '' || opt.pros.length > 0 || opt.cons.length > 0) {
                let res = total.concat('\n### ' + opt.title + '\n\n')
                if (opt.description !== '') {
                    res = res.concat(opt.description + '\n\n')
                }
                res = opt.pros.reduce((total, arg) => (total.concat('* Good, because ' + arg + '\n')), res)
                res = opt.cons.reduce((total, arg) => (total.concat('* Bad, because ' + arg + '\n')), res)
                return res
            } else {
                return total
            }
        }, md)
    }
    if (adr.links.length > 0) {
        md = md.concat('\n## Links \n\n')
        md = adr.links.reduce((total, link) => (total + '* ' + link + '\n'), md)
    }
    return md
}