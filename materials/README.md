# materials/

Put lecture files here (PPTX, PDF, handouts, sample data), then list each one in `js/course.js` under that lab's `materials`:

```js
{ id: 'lab-02', …, materials: [
  { label: 'Lab 2 slides (PPTX)', href: 'materials/LAB_02_Basics_of_C.pptx' },
  { label: 'Lab 2 handout (PDF)', href: 'materials/LAB_02_handout.pdf' }
] }
```

The files then appear as download links on the lab's card on the home page.

Keep answer keys and solution files out of this folder: if the repository is public, everything in it can be downloaded.
