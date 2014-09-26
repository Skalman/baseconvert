<?php
include 'includes/webstart.php';

$title = 'Converting numbers with JavaScript';
$description = 'Convert to and from different bases with JavaScript';

?>
<h1>Converting numbers with JavaScript</h1>

<p>It's <i>really</i> easy, using the built-in functions:</p>

<pre><code>(255).toString(16);   // ff
(1.75).toString(2);   // 1.11
(90827).toString(36); // 1y2z
</code></pre>

<p>Try it yourself:</p>

<p><code>(<input type="text" />).toString(<input type="text" />); // <output></output></code></p>

As you can see, it works well with 

<blockquote class="short">
	There are 10 kinds of people: those who understand binary, and those who don't.
</blockquote>
