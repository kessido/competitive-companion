import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class HackerRankProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.hackerrank.com/challenges/*/problem*', 'https://www.hackerrank.com/contests/*/challenges/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder().setUrl(url);

    task.setName(elem.querySelector('h1.page-label, h2.hr_tour-challenge-name').textContent.trim());

    const breadCrumbs = [...elem.querySelectorAll('.breadcrumb-item-text')].map(el => el.textContent);
    task.setGroup(['HackerRank', ...breadCrumbs.slice(1, -1)].join(' - '));

    this.parseTests(html, task);

    task.setTimeLimit(4000);
    task.setMemoryLimit(512);

    return task.build();
  }

  public parseTests(html: string, task: TaskBuilder): void {
    const elem = htmlToElement(html);

    let blocks = elem.querySelectorAll('.challenge_sample_input pre, .challenge_sample_output pre');

    if (blocks.length === 0) {
      blocks = elem.querySelectorAll('.challenge-body-html pre');
    }

    for (let i = 0; i < blocks.length; i += 2) {
      const input = blocks[i].textContent.trim();
      const output = blocks[i + 1].textContent.trim();

      task.addTest(input, output);
    }
  }
}
