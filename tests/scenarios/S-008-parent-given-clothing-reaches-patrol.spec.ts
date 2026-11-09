// piezas-scenario: S-008 v=72ec13de2360
// S-008: Parent-given clothing reaches patrol
//   Given Owen's parent added "red jacket, blue helmet" for today and his instructor reported "blue jacket, white helmet"
//   When patrol opens Owen's packet
//   Then both descriptions appear, each labelled with who gave it
import { expect, test } from '@playwright/test';
import { CHILD_IDS } from '../../lib/fixtures';
import { NGOZI, openSection, saveProfile } from '../parent-helpers';
import { closeIncidentsFor, instructorReports, patrolOpensPacket } from '../safety-helpers';
import { signIn } from '../sign-in';

test("S-008: the parent's and the instructor's clothing both reach patrol, labelled", async ({ page }) => {
  await closeIncidentsFor(page, CHILD_IDS.owen);

  await signIn(page, NGOZI);
  await page.goto(`/parent/children/${CHILD_IDS.owen}`);
  await openSection(page, 'section-lesson');
  await page.getByTestId('clothing-today').fill('Red jacket, blue helmet');
  await saveProfile(page);

  await instructorReports(page, CHILD_IDS.owen, { time: '14:30', location: 'Top of the Pigeon chair', clothing: 'Blue jacket, white helmet' });

  await patrolOpensPacket(page, CHILD_IDS.owen);
  await expect(page.getByTestId('packet-parent-clothing-label')).toHaveText('Clothing today, from parent');
  await expect(page.getByTestId('packet-parent-clothing')).toHaveText('Red jacket, blue helmet');
  await expect(page.getByTestId('packet-reported-clothing-label')).toHaveText('Clothing reported by Jordan Lee');
  await expect(page.getByTestId('packet-reported-clothing')).toHaveText('Blue jacket, white helmet');
});
